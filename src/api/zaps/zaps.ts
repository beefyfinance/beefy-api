import { CachedGitJson } from './CachedGitJson';
import { MULTICHAIN_ENDPOINTS } from '../../constants';
import { AmmConfig, BeefyZapConfig, OneInchZapConfig, ZapConfigsByType } from './types';
import {
  areTokensEqual,
  getTokenById,
  getTokenWrappedNative,
  initTokenService,
  nativeToWrapped,
} from '../tokens/tokens';
import { getAmmAllPrices } from '../stats/getAmmPrices';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { ApiChain, AppChain, toAppChain } from '../../utils/chain';
import { getMultichainVaults, getSingleChainVaults } from '../stats/getMultichainVaults';
import { Vault } from '../vaults/types';
import { isFiniteNumber } from '../../utils/number';
import BigNumber from 'bignumber.js';
import { getOneInchPriceApi, getOneInchSwapApi } from './one-inch';
import { BIG_ONE, BIG_ZERO, isFiniteBigNumber, toWeiString } from '../../utils/big-number';
import { IOneInchPriceApi, IOneInchSwapApi } from './one-inch/types';
import { errorToString } from '../../utils/error';
import { keyBy, sortBy, uniq } from 'lodash';
import { isResultFulfilled, isResultRejected } from '../../utils/promise';
import { getKey, setKey } from '../../utils/cache';
import { TokenEntity, TokenErc20 } from '../tokens/types';

const GH_ORG = 'beefyfinance';
const GH_REPO = 'beefy-v2';
const GH_BRANCH = 'prod';
const DEBUG = false;
const REDIS_KEY = 'ZAP_SUPPORT';

const ammConfigChains: ReadonlyArray<ApiChain> = Object.keys(
  MULTICHAIN_ENDPOINTS
) as (keyof typeof MULTICHAIN_ENDPOINTS)[];

let zapsConfigByType: ZapConfigsByType | undefined;
let ammConfigsByChain: Record<string, CachedGitJson<AmmConfig[]>> | undefined;
let zapSupportByVault: Record<string, ZapSupport> = {};
let zapsSupportedByVault: Record<string, string[]> = {};

async function initZapConfigs() {
  zapsConfigByType = {
    beefy: await CachedGitJson.create<BeefyZapConfig[]>({
      org: GH_ORG,
      repo: GH_REPO,
      branch: GH_BRANCH,
      path: `src/config/zap/beefy.json`,
      updateOnInterval: 60 * 60, // 1 hour
      updateOnStart: true,
      debug: DEBUG,
    }),
    oneInch: await CachedGitJson.create<OneInchZapConfig[]>({
      org: GH_ORG,
      repo: GH_REPO,
      branch: GH_BRANCH,
      path: `src/config/zap/one-inch.json`,
      updateOnInterval: 60 * 60, // 1 hour
      updateOnStart: true,
      debug: DEBUG,
    }),
  };
}

async function initAmmConfigs() {
  ammConfigsByChain = Object.fromEntries(
    await Promise.all(
      ammConfigChains.map(async chain => {
        const ammConfig = await CachedGitJson.create<AmmConfig[]>({
          org: GH_ORG,
          repo: GH_REPO,
          branch: GH_BRANCH,
          path: `src/config/amm/${toAppChain(chain)}.json`,
          updateOnInterval: 60 * 60, // 1 hour
          updateOnStart: true,
          debug: DEBUG,
        });

        return [chain, ammConfig] as const;
      })
    )
  );
}

export async function initZapService() {
  // Load
  await loadFromRedis();

  // Setup
  await Promise.all([initZapConfigs(), initAmmConfigs()]);

  // Update
  await performUpdate();
}

async function waitForConfigs() {
  return Promise.all([
    ...Object.values(ammConfigsByChain).map(config => config.waitForAvailable()),
    ...Object.values(zapsConfigByType).map(config => config.waitForAvailable()),
  ]);
}

async function waitForDependencies() {
  return Promise.all([
    waitForConfigs(),
    serviceEventBus.waitForFirstEvent('vaults/updated'),
    serviceEventBus.waitForFirstEvent('boosts/updated'),
    serviceEventBus.waitForFirstEvent('tokens/updated'),
    getAmmAllPrices(),
  ]);
}

type ZapSupport = {
  vaultId: string;
  chainId: AppChain;
  beefy: {
    supported: boolean;
    unsupportedReason?: string;
  };
  oneInch: {
    supported: boolean;
    unsupportedReason?: string;
  };
};

type ZapDisabled = { id: string; supported: false; unsupportedReason: string };
type ZapEnabled = { id: string; supported: true };
type ZapStatus = ZapDisabled | ZapEnabled;

async function checkBeefy(
  vaults: Vault[],
  apiChain: ApiChain,
  appChain: AppChain
): Promise<ZapStatus[]> {
  const beefyZaps = zapsConfigByType.beefy.value.filter(zap => zap.chainId === appChain);

  return vaults.map(vault => {
    if (!beefyZaps.length) {
      return { id: vault.id, supported: false, unsupportedReason: 'No beefy zaps for chain' };
    }

    if (vault.isGovVault) {
      return { id: vault.id, supported: false, unsupportedReason: 'Gov vault not supported' };
    }

    if (vault.oracle !== 'lps') {
      return { id: vault.id, supported: false, unsupportedReason: 'Deposit token is not LP token' };
    }

    if (!vault.assets || vault.assets.length !== 2) {
      return {
        id: vault.id,
        supported: false,
        unsupportedReason: 'Vault does not have exactly 2 assets',
      };
    }

    const { missingAssets } = checkAssetTokens(vault.assets, apiChain);
    if (missingAssets.length) {
      return {
        id: vault.id,
        supported: false,
        unsupportedReason: `Missing token in assets: ${missingAssets.join(', ')}`,
      };
    }

    if (!vault.tokenAmmId) {
      return {
        id: vault.id,
        supported: false,
        unsupportedReason: 'No AMM defined for deposit LP token',
      };
    }

    const amm = ammConfigsByChain[apiChain].value.find(amm => amm.id === vault.tokenAmmId);
    if (!amm) {
      return {
        id: vault.id,
        supported: false,
        unsupportedReason: 'Invalid AMM defined for deposit LP token',
      };
    }

    const zap = beefyZaps.find(zap => zap.ammId === amm.id);
    if (!zap) {
      return {
        id: vault.id,
        supported: false,
        unsupportedReason: 'No zap for AMM of deposit LP token',
      };
    }

    return { id: vault.id, supported: true };
  });
}

function checkAssetTokens(
  assets: string[],
  apiChain: ApiChain
): { tokens: TokenEntity[]; missingAssets: string[] } {
  const tokens = assets.map(asset => getTokenById(asset, apiChain));
  const missingAssets = assets.filter((asset, i) => !tokens[i]);
  return { tokens, missingAssets };
}

function markTokenUnsupported(
  tokenAddress: string,
  reason: string,
  tokenAddressToVaults: Record<string, Vault[]>,
  tokenAddressToToken: Record<string, TokenErc20>,
  resultsById: Record<string, ZapStatus>
) {
  const vaultsToMark = tokenAddressToVaults[tokenAddress];
  if (!vaultsToMark || !vaultsToMark.length) {
    // console.warn(`markTokenUnsupported: No vaults found for token ${tokenAddress}: ${reason}`);
    return;
  }

  // Do not perform further tests on this token
  delete tokenAddressToVaults[tokenAddress];
  delete tokenAddressToToken[tokenAddress];

  // Mark all vaults using this token as unsupported
  for (const vault of vaultsToMark) {
    if (!(vault.id in resultsById)) {
      resultsById[vault.id] = {
        id: vault.id,
        supported: false,
        unsupportedReason: reason,
      };
    }
  }

  // For each vault removed
  for (const vault of vaultsToMark) {
    // Find this vault under other tokens
    for (const [address, vaults] of Object.entries(tokenAddressToVaults)) {
      // Remove this vault from that list
      tokenAddressToVaults[address] = vaults.filter(v => v.id !== vault.id);
      // If list is empty, we no longer need to test this token either
      if (tokenAddressToVaults[address].length === 0) {
        delete tokenAddressToVaults[address];
        delete tokenAddressToToken[address];
      }
    }
  }
}

async function checkOneInch(
  vaults: Vault[],
  apiChain: ApiChain,
  appChain: AppChain
): Promise<ZapStatus[]> {
  const oneInchZap = zapsConfigByType.oneInch.value.find(zap => zap.chainId === appChain);
  if (!oneInchZap) {
    return vaults.map(vault => ({
      id: vault.id,
      supported: false,
      unsupportedReason: 'No 1inch zap for chain',
    }));
  }

  const tokenAddressToVaults: Record<string, Vault[]> = {};
  const tokenAddressToToken: Record<string, TokenErc20> = {};

  const resultsById: Record<string, ZapStatus> = Object.fromEntries(
    vaults
      .map(vault => {
        if (oneInchZap.blockedVaults.includes(vault.id)) {
          return { id: vault.id, supported: false, unsupportedReason: 'Vault is manually blocked' };
        }

        if (vault.isGovVault) {
          return { id: vault.id, supported: false, unsupportedReason: 'Gov vault not supported' };
        }

        if (vault.oracle === 'lps') {
          if (!vault.assets || vault.assets.length !== 2) {
            return {
              id: vault.id,
              supported: false,
              unsupportedReason: 'Vault does not have exactly 2 assets',
            };
          }

          if (!vault.tokenAmmId) {
            return {
              id: vault.id,
              supported: false,
              unsupportedReason: 'No AMM defined for deposit LP token',
            };
          }

          const amm = ammConfigsByChain[apiChain].value.find(amm => amm.id === vault.tokenAmmId);
          if (!amm) {
            return {
              id: vault.id,
              supported: false,
              unsupportedReason: 'Invalid AMM defined for deposit LP token',
            };
          }
        } else if (vault.oracle === 'tokens') {
          if (!vault.assets || vault.assets.length !== 1) {
            return {
              id: vault.id,
              supported: false,
              unsupportedReason: 'Vault does not have exactly 1 asset',
            };
          }
        } else {
          return {
            id: vault.id,
            supported: false,
            unsupportedReason: 'Vault does not have a valid oracle type',
          };
        }

        const { tokens, missingAssets } = checkAssetTokens(vault.assets, apiChain);
        if (missingAssets.length) {
          return {
            id: vault.id,
            supported: false,
            unsupportedReason: `Missing token in assets: ${missingAssets.join(', ')}`,
          };
        }

        // internally we only swap wnative, not native
        const lpTokens = tokens.map(nativeToWrapped);
        for (const token of lpTokens) {
          if (!tokenAddressToVaults[token.address]) {
            tokenAddressToVaults[token.address] = [];
          }
          tokenAddressToVaults[token.address].push(vault);
          tokenAddressToToken[token.address] = token;
        }
      })
      .filter(r => !!r)
      .map(r => [r.id, r])
  );

  // No more to check
  if (!Object.keys(tokenAddressToVaults).length) {
    return Object.values(resultsById);
  }

  // Token: Beefy prices
  const beefyPrices = await getAmmAllPrices();
  const beefyPriceByAddress: Record<string, number> = {};
  for (const [tokenAddress, token] of Object.entries(tokenAddressToToken)) {
    const price = beefyPrices[token.oracleId];

    // No price: stop checking this token/vaults with this token
    if (!isFiniteNumber(price) || price <= 0) {
      markTokenUnsupported(
        tokenAddress,
        `No beefy price available for token ${token.id} with oracleId ${token.oracleId}`,
        tokenAddressToVaults,
        tokenAddressToToken,
        resultsById
      );
    } else {
      beefyPriceByAddress[tokenAddress] = price;
    }
  }

  // No more to check
  if (!Object.keys(tokenAddressToVaults).length) {
    return Object.values(resultsById);
  }

  // Token: 1inch prices
  const wnative = getTokenWrappedNative(apiChain);
  const oneInchPriceApi = getOneInchPriceApi(apiChain, oneInchZap.priceOracleAddress);
  const oneInchNativePriceByAddress = await getOneInchPricesInNative(
    oneInchPriceApi,
    Object.values(tokenAddressToToken),
    wnative
  );
  for (const [tokenAddress, token] of Object.entries(tokenAddressToToken)) {
    const price = oneInchNativePriceByAddress[tokenAddress];

    // No price: stop checking this token/vaults with this token
    if (!isFiniteBigNumber(price) || price.lte(BIG_ZERO)) {
      markTokenUnsupported(
        tokenAddress,
        `No 1inch price available for token ${token.id} with address ${token.address}`,
        tokenAddressToVaults,
        tokenAddressToToken,
        resultsById
      );
    }
  }

  // No more to check
  if (!Object.keys(tokenAddressToVaults).length) {
    return Object.values(resultsById);
  }

  // Token: Beefy vs 1inch prices
  const beefyNativeUsdPrice = beefyPriceByAddress[wnative.address];
  for (const [tokenAddress, token] of Object.entries(tokenAddressToToken)) {
    const beefyUsdPrice = new BigNumber(beefyPriceByAddress[tokenAddress]);
    const oneInchUsdPrice =
      oneInchNativePriceByAddress[tokenAddress].multipliedBy(beefyNativeUsdPrice);
    const isClose = oneInchUsdPrice
      .minus(beefyUsdPrice)
      .dividedBy(beefyUsdPrice)
      .absoluteValue()
      .isLessThan(0.1);

    // Prices difference is too much
    if (!isClose) {
      markTokenUnsupported(
        tokenAddress,
        `Price difference for token ${token.id}: beefy=${beefyUsdPrice.toString(
          10
        )} 1inch=${oneInchUsdPrice.toString(10)}`,
        tokenAddressToVaults,
        tokenAddressToToken,
        resultsById
      );
    }
  }

  // No more to check
  if (!Object.keys(tokenAddressToVaults).length) {
    return Object.values(resultsById);
  }

  // Token: 1inch swap
  const oneInchSwapApi = getOneInchSwapApi(apiChain);
  const testAmount = BIG_ONE.dividedBy(beefyNativeUsdPrice).multipliedBy(100); // 100 USD of native
  const canSwapByAddress = await getCanSwapOnOneInch(
    oneInchSwapApi,
    Object.values(tokenAddressToToken),
    wnative,
    testAmount
  );
  for (const [tokenAddress, token] of Object.entries(tokenAddressToToken)) {
    const successOrReason = canSwapByAddress[tokenAddress];

    // 1inch quote failed
    if (successOrReason !== true) {
      markTokenUnsupported(
        tokenAddress,
        `1inch quote failed for token ${token.id}: ${successOrReason}`,
        tokenAddressToVaults,
        tokenAddressToToken,
        resultsById
      );
    }
  }

  // Vault: Manual token blocks
  // We wait until here to apply manual token blocks so that we can see if auto-block would catch it or not
  for (const vaults of Object.values(tokenAddressToVaults)) {
    for (const vault of vaults) {
      const blockedAssets = vault.assets.filter(asset => oneInchZap.blockedTokens.includes(asset));
      if (blockedAssets.length && !(vault.id in resultsById)) {
        resultsById[vault.id] = {
          id: vault.id,
          supported: false,
          unsupportedReason: `Token is manually blocked: ${blockedAssets.join(', ')}`,
        };
      }
    }
  }

  // Anything left is supported
  for (const vaults of Object.values(tokenAddressToVaults)) {
    for (const vault of vaults) {
      if (!(vault.id in resultsById)) {
        resultsById[vault.id] = {
          id: vault.id,
          supported: true,
        };
      }
    }
  }

  return Object.values(resultsById);
}

async function getCanSwapOnOneInch(
  api: IOneInchSwapApi,
  tokens: TokenErc20[],
  wnative: TokenErc20,
  amount: BigNumber
): Promise<Record<string, true | string>> {
  const amountInWei = toWeiString(amount, wnative.decimals);
  const tokensExcludingWnative = tokens.filter(t => !areTokensEqual(t, wnative));

  // Don't quote wnative:wnative
  const calls = tokensExcludingWnative.map(token =>
    api.getQuote({
      fromTokenAddress: token.address,
      toTokenAddress: wnative.address,
      amount: amountInWei,
    })
  );
  const results = await Promise.allSettled(calls);

  // Return a map of token address to true if it can be swapped, or error string if not
  // wnative is always swappable
  return results.reduce(
    (canSwap, result, i) => {
      if (result.status === 'fulfilled') {
        canSwap[tokensExcludingWnative[i].address] = true;
      } else {
        canSwap[tokensExcludingWnative[i].address] = errorToString(result.reason);
      }

      return canSwap;
    },
    { [wnative.address]: true } as Record<string, true | string>
  );
}

async function getOneInchPricesInNative(
  api: IOneInchPriceApi,
  tokens: TokenErc20[],
  wnative: TokenErc20
): Promise<Record<string, BigNumber>> {
  // Don't quote wnative
  const tokensExcludingWnative = tokens.filter(t => !areTokensEqual(t, wnative));
  const tokenAddresses = tokensExcludingWnative.map(t => t.address);
  const ratesByAddress = await api.getRatesToNative(tokenAddresses);

  return tokensExcludingWnative.reduce(
    (prices, token) => {
      const rate = ratesByAddress[token.address];
      if (!rate || rate.isZero()) {
        return prices;
      }

      prices[token.address] = rate
        .shiftedBy(-wnative.decimals)
        .decimalPlaces(wnative.decimals, BigNumber.ROUND_FLOOR)
        .shiftedBy(token.decimals)
        .decimalPlaces(0, BigNumber.ROUND_FLOOR)
        .shiftedBy(-wnative.decimals);

      return prices;
    },
    { [wnative.address]: BIG_ONE } as Record<string, BigNumber>
  );
}

async function fetchVaultZapSupportForChain(apiChain: ApiChain): Promise<ZapSupport[]> {
  const appChain = toAppChain(apiChain);
  const vaults = getSingleChainVaults(apiChain);
  if (!vaults || !vaults.length) {
    return [];
  }

  const supportById: Record<string, ZapSupport> = Object.fromEntries(
    vaults.map(vault => {
      return [
        vault.id,
        {
          vaultId: vault.id,
          chainId: vault.network,
          beefy: {
            supported: false,
            unsupportedReason: 'Not checked',
          },
          oneInch: {
            supported: false,
            unsupportedReason: 'Not checked',
          },
        },
      ];
    })
  );

  const [beefyResults, oneInchResults] = await Promise.all([
    checkBeefy(vaults, apiChain, appChain),
    checkOneInch(vaults, apiChain, appChain),
  ]);

  const resultsByType = {
    beefy: beefyResults,
    oneInch: oneInchResults,
  };

  for (const [type, results] of Object.entries(resultsByType)) {
    results.forEach(result => {
      if (result.id in supportById) {
        supportById[result.id][type].supported = result.supported;
        if (result.supported === true) {
          delete supportById[result.id][type].unsupportedReason;
        } else {
          supportById[result.id][type].unsupportedReason = result.unsupportedReason;
        }
      }
    });
  }

  return Object.values(supportById);
}

function scheduleUpdate() {
  // Schedule next update for when vaults or prices change
  Promise.race([
    serviceEventBus.waitForNextEvent('prices/updated'),
    serviceEventBus.waitForNextEvent('vaults/updated'),
  ]).then(performUpdate);
}

async function performUpdate() {
  console.log('> Updating zap service...');
  try {
    const start = Date.now();

    // Wait for all data to be ready
    await waitForDependencies();

    // Update all chains
    const chainsWithVaults = uniq(getMultichainVaults().map(vault => vault.chain));
    const results = await Promise.allSettled(chainsWithVaults.map(fetchVaultZapSupportForChain));

    const fulfilled = results.filter(isResultFulfilled);

    if (fulfilled.length) {
      const allResults = sortBy(
        fulfilled.flatMap(result => result.value),
        'vaultId'
      );
      zapSupportByVault = keyBy(allResults, 'vaultId');
      buildFromByVault();
      await saveToRedis();
    }

    console.log(
      `> Zap availability for ${fulfilled.length}/${results.length} chains updated (${
        (Date.now() - start) / 1000
      }s)`
    );

    if (fulfilled.length < results.length) {
      const rejected = results.filter(isResultRejected);
      console.error(` - ${rejected.length} chains failed to update:`);
      rejected.forEach(result => console.error(`  - ${result.reason}`));
    }
  } catch (err) {
    console.error(`> Zap service update failed`, err);
  } finally {
    scheduleUpdate();
  }
}

function buildFromByVault() {
  const anySupported = Object.values(zapSupportByVault).filter(
    result => result.beefy.supported || result.oneInch.supported
  );
  zapsSupportedByVault = Object.fromEntries(
    anySupported.map(result => [
      result.vaultId,
      ['beefy', 'oneInch'].filter(type => result[type].supported),
    ])
  );
}

async function loadFromRedis() {
  const cachedSupport = await getKey<typeof zapSupportByVault>(REDIS_KEY);

  if (cachedSupport && typeof cachedSupport === 'object') {
    zapSupportByVault = cachedSupport;
    buildFromByVault();
  }
}

async function saveToRedis() {
  await setKey(REDIS_KEY, zapSupportByVault);
}

export function getZapSupportByVault(): Record<string, string[]> | undefined {
  return Object.keys(zapsSupportedByVault).length ? zapsSupportedByVault : undefined;
}

export function getZapSupportByVaultDebug(): Record<string, ZapSupport> | undefined {
  return Object.keys(zapSupportByVault).length ? zapSupportByVault : undefined;
}
