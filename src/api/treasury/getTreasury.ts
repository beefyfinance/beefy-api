import BigNumber from 'bignumber.js';
import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall';
import { chunk, keyBy, partition } from 'lodash';
import { addressBook } from '../../../packages/address-book/address-book';
import chainIdMap from '../../../packages/address-book/util/chainIdMap';
import { getKey, setKey } from '../../utils/cache';
import { web3Factory } from '../../utils/web3';
import { getSingleChainVaults } from '../stats/getMultichainVaults';
import {
  extractBalancesFromTreasuryApiCallResults,
  extractBalancesFromTreasuryMulticallResults,
  fetchAPIBalance,
  mapAssetToCall,
} from './multicallUtils';
import {
  isValidatorAsset,
  isVaultAsset,
  TreasuryApiResult,
  TreasuryAsset,
  TreasuryAssetRegistry,
  TreasuryBalances,
  TreasuryReport,
  TreasuryWalletRegistry,
  ValidatorAsset,
} from './types';
import { getChainValidator, hasChainValidator } from './validatorHelpers';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { ApiChain, ApiChains, toChainId } from '../../utils/chain';
import { getTokensForChain, isTokenNative } from '../tokens/tokens';
import { MULTICALL_V3 } from '../../utils/web3Helpers';
import { getAmmPrice } from '../stats/getAmmPrices';
import { keysToObject } from '../../utils/array';

const REFRESH_INTERVAL = 60000 * 10;
const MULTICALL_BATCH_SIZES: Partial<Record<ApiChain, number>> = {
  fantom: 512,
  polygon: 256,
};

const batchSizeForChain = (chain: ApiChain) => {
  return MULTICALL_BATCH_SIZES[chain] ?? 1024;
};
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// treasury addresses that should be queried for balances
let treasuryAddressesByChain: TreasuryWalletRegistry;

// addressbook + vault tokens where balances should be queried
let assetsByChain: TreasuryAssetRegistry = keysToObject(ApiChains, () => ({}));

let tokenBalancesByChain: TreasuryBalances = keysToObject(ApiChains, () => ({}));

let treasurySummary: TreasuryReport = keysToObject(ApiChains, () => ({}));

function updateTreasuryAddressesByChain() {
  treasuryAddressesByChain = keysToObject(ApiChains, chain => {
    const chainAddressbook = addressBook[chain];
    const addresses = {};
    const treasuryMultisig = chainAddressbook.platforms.beefyfinance.treasuryMultisig;
    const treasury = chainAddressbook.platforms.beefyfinance.treasury;

    if (treasuryMultisig && treasuryMultisig !== ZERO_ADDRESS) {
      addresses[treasuryMultisig.toLowerCase()] = {
        address: treasuryMultisig,
        label: 'treasuryMultisig',
      };
    }

    // Add treasury only if different from multisig
    if (treasury && treasury !== ZERO_ADDRESS && !addresses[treasury.toLowerCase()]) {
      addresses[treasury.toLowerCase()] = {
        address: treasury,
        label: 'treasury',
      };
    }

    return addresses;
  });
}

function updateAssetsByChain() {
  const tokenAssets = getTokenAddressesByChain();
  const vaultAssets = getVaultAddressesByChain();

  assetsByChain = keysToObject(ApiChains, chain => {
    return {
      ...(tokenAssets[chain] || {}),
      ...(vaultAssets[chain] || {}),
    };
  });
}

// Load token address
function getTokenAddressesByChain(): TreasuryAssetRegistry {
  return keysToObject(ApiChains, chain => {
    const tokens: Record<string, TreasuryAsset> = {};

    for (const [tokenAddress, token] of Object.entries(getTokensForChain(chain))) {
      // WNATIVE/NATIVE: duplicated as WBNB/BNB, WETH/ETH etc
      if (['WNATIVE', 'NATIVE'].includes(token.id)) continue;
      // WCELO/WMETIS: duplicate as same as native
      if (
        [
          '0x471EcE3750Da237f93B8E339c536989b8978a438',
          '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
        ].includes(token.address)
      )
        continue;

      tokens[tokenAddress] = {
        name: token.name,
        address: token.address,
        decimals: token.decimals,
        assetType: isTokenNative(token) ? 'native' : 'token',
        oracleId: token.oracleId,
        oracleType: token.oracle,
      };
    }

    if (hasChainValidator(chain)) {
      tokens['validator'] = getChainValidator(chain);
    }

    return tokens;
  });
}

function getVaultAddressesByChain(): TreasuryAssetRegistry {
  return keysToObject(ApiChains, chain => {
    const chainVaults = getSingleChainVaults(chain) || [];
    return keyBy(
      chainVaults.map(vault => ({
        name: vault.earnedToken,
        oracleId: vault.oracleId,
        oracleType: vault.oracle,
        assetType: 'vault',
        vaultId: vault.id,
        decimals: vault.tokenDecimals,
        pricePerFullShare: vault.pricePerFullShare,
        address: vault.earnContractAddress,
      })),
      asset => asset.address.toLowerCase()
    );
  });
}

async function updateSingleChainTreasuryBalance(chain: ApiChain) {
  const assetsToCheck = Object.values(assetsByChain[chain]);
  const web3 = web3Factory(chainIdMap[chain]);
  const treasuryAddressesForChain = Object.values(treasuryAddressesByChain[chain]);
  const multicallAddress = MULTICALL_V3[toChainId(chain)];
  if (!multicallAddress) {
    throw new Error(`Multicallv3 address not found for chain ${chain}`);
  }

  const multicall = new Multicall({
    web3Instance: web3,
    tryAggregate: true,
    multicallCustomContractAddress: multicallAddress,
  });
  // ETH validator requires an api call, should be treated differently
  const [validatorAsset, contractAssets] = partition(
    assetsToCheck,
    asset => isValidatorAsset(asset) && asset.method === 'api'
  );

  const contractCallContext: ContractCallContext[] = contractAssets.flatMap(
    (asset: TreasuryAsset) => mapAssetToCall(asset, treasuryAddressesForChain, multicallAddress)
  );

  const contractPromises: Promise<ContractCallResults>[] = chunk(
    contractCallContext,
    batchSizeForChain(chain)
  ).map(batch => multicall.call(batch));

  const apiPromises = validatorAsset.map(asset => fetchAPIBalance(asset as ValidatorAsset));

  try {
    const results = await Promise.allSettled([...contractPromises, ...apiPromises]);
    const hasOneFailedCall = results.some(res => res.status === 'rejected');

    const contractResults = await Promise.allSettled(contractPromises);
    const apiResults = await Promise.allSettled(apiPromises);

    const balancesForChain = {};
    treasuryAddressesForChain.forEach((treasuryData: any) => {
      balancesForChain[treasuryData.address.toLowerCase()] = {};
    });

    const fulfilledContractResults = Object.fromEntries(
      contractResults
        .filter(res => res.status === 'fulfilled')
        .flatMap((res: PromiseFulfilledResult<ContractCallResults>) =>
          Object.entries(res.value.results)
        )
    );

    if (Object.keys(fulfilledContractResults).length !== contractCallContext.length) {
      console.log('> Multicall batch failed fetching balances for treasury on ' + chain);
      console.log(
        contractResults
          .filter(res => res.status === 'rejected')
          .map((p: PromiseRejectedResult) => p.reason)
      );
    }

    const fulfilledApiResults = apiResults
      .filter(res => res.status === 'fulfilled')
      .flatMap((res: PromiseFulfilledResult<TreasuryApiResult>) => res.value);

    if (Object.keys(fulfilledApiResults).length !== apiPromises.length) {
      console.log('> Api call failed fetching balances for treasury on ' + chain);
    }

    //If we have at least one failed call, we keep the previous cache, if not we purge outdated values
    tokenBalancesByChain[chain] = {
      ...(tokenBalancesByChain[chain] && hasOneFailedCall ? tokenBalancesByChain[chain] : {}),
      ...extractBalancesFromTreasuryMulticallResults(fulfilledContractResults),
      ...extractBalancesFromTreasuryApiCallResults(fulfilledApiResults),
    };
  } catch (err) {
    console.log('error updating treasury balances on chain ' + chain);
  }
}

async function updateTreasuryBalances() {
  try {
    console.log('> updating treasury balances');
    const start = Date.now();

    await Promise.allSettled(ApiChains.map(updateSingleChainTreasuryBalance));
    await buildTreasuryReport();
    await saveToRedis();
    console.log(`> treasury balances updated (${((Date.now() - start) / 1000).toFixed(2)}s)`);
  } catch (err) {
    console.log(`> error updating treasury`);
  } finally {
    setTimeout(() => {
      updateTreasuryBalances();
    }, REFRESH_INTERVAL);
  }
}

async function buildTreasuryReport() {
  const chainReports = await Promise.all(ApiChains.map(buildTreasuryReportForChain));
  for (const i in ApiChains) {
    treasurySummary[ApiChains[i]] = chainReports[i];
  }
}

async function buildTreasuryReportForChain(chain: ApiChain): Promise<TreasuryReport[ApiChain]> {
  const chainBalancesByAddress = tokenBalancesByChain[chain];
  const balanceReport: TreasuryReport[ApiChain] = {};

  const chainTreasuryWallets = treasuryAddressesByChain[chain];
  for (const [address, wallet] of Object.entries(chainTreasuryWallets)) {
    balanceReport[address] = {
      name: wallet.label,
      balances: {},
    };
  }

  for (const assetBalance of Object.values(chainBalancesByAddress)) {
    const treasuryAsset = assetsByChain[chain][assetBalance.address];

    if (treasuryAsset === undefined) {
      continue; // cached asset hasn't been deleted yet
    }

    let price: number | undefined;
    for (const [treasuryWallet, balance] of Object.entries(assetBalance.balances)) {
      try {
        if (balance.gt(0)) {
          if (price === undefined) {
            price = (await getAmmPrice(treasuryAsset.oracleId, true)) || 0;
          }

          // Add validator wallet if missing
          if (!balanceReport[treasuryWallet]) {
            balanceReport[treasuryWallet] = { name: treasuryWallet, balances: {} };
          }
          const usdValue = findUsdValueForBalance(treasuryAsset, price, balance);
          balanceReport[treasuryWallet].balances[treasuryAsset.address] = {
            ...treasuryAsset,
            price,
            usdValue: usdValue.toString(10),
            balance: balance.toString(10),
          };
        }
      } catch (err) {
        console.log(`> error setting treasury balance on ${chain} for asset ${treasuryAsset.name}`);
      }
    }
  }

  return balanceReport;
}

function findUsdValueForBalance(
  tokenInfo: TreasuryAsset,
  tokenPrice: number,
  balance: BigNumber
): BigNumber {
  if (isVaultAsset(tokenInfo)) {
    return balance
      .multipliedBy(tokenPrice)
      .multipliedBy(tokenInfo.pricePerFullShare)
      .shiftedBy(-18)
      .shiftedBy(-tokenInfo.decimals);
  } else {
    return balance.multipliedBy(tokenPrice).shiftedBy(-tokenInfo.decimals);
  }
}

async function saveToRedis() {
  await setKey('TREASURY_BALANCES', tokenBalancesByChain);
  await setKey('TREASURY_REPORT', treasurySummary);
}

async function restoreFromRedis() {
  const cachedSummary = await getKey<TreasuryReport>('TREASURY_REPORT');
  const cachedBalances = await getKey<TreasuryBalances>('TREASURY_BALANCES');
  if (cachedSummary) {
    treasurySummary = cachedSummary;
  }
  if (cachedBalances) {
    tokenBalancesByChain = cachedBalances;
    //Need balance values as bignumbers, not strings
    Object.values(tokenBalancesByChain).forEach(chainBalances => {
      Object.values(chainBalances).forEach(walletBalance => {
        Object.keys(walletBalance.balances).forEach(key => {
          walletBalance.balances[key] = new BigNumber(walletBalance.balances[key]);
        });
      });
    });
  }
}

export async function initTreasuryService() {
  // Load from redis if available
  await restoreFromRedis();

  // Wait until we have tokens and vaults
  await Promise.all([
    serviceEventBus.waitForFirstEvent('tokens/updated'),
    serviceEventBus.waitForFirstEvent('vaults/updated'),
  ]);

  // Fetch treasury addresses, these are inferred from the addressbook so no need to update till api restarts
  updateTreasuryAddressesByChain();

  // Initialize tokens/vault assets
  updateAssetsByChain();

  // Update balances
  await updateTreasuryBalances();

  // Update tokens/vault assets whenever tokens (or vaults) are updated
  serviceEventBus.on('tokens/updated', updateAssetsByChain);
}

export function getBeefyTreasury(): TreasuryReport {
  return treasurySummary;
}
