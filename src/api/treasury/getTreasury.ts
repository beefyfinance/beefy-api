import { BigNumber  }from 'bignumber.js';
import { addressBook } from '../../../packages/address-book/src/address-book/index.ts';
import { chainIdMap } from '../../../packages/address-book/src/util/chainIdMap.ts';
import { getKey, setKey } from '../../utils/cache/index.ts';
import { extractBalancesFromTreasuryCallResults, mapAssetToCall } from './multicallUtils.ts';
import { getTokenAddressesByChain, getVaultAddressesByChain } from './assetHelpers.ts';
import {
  isGovAsset,
  isValidatorAsset,
  isVaultAsset,
  type TreasuryAsset,
  type TreasuryAssetRegistry,
  type TreasuryBalances,
  type TreasuryReport,
  type TreasuryWalletRegistry,
} from './types.ts';
import { serviceEventBus } from '../../utils/ServiceEventBus.ts';
import { type ApiChain, SupportedChains } from '../../utils/chain.ts';
import { getAmmPrice } from '../stats/getAmmPrices.ts';
import { keysToObject } from '../../utils/array.ts';
import { ZERO_ADDRESS } from '../../utils/address.ts';
import { contextAllSettled, isContextResultRejected, withTimeout } from '../../utils/promise.ts';
import { envNumber } from '../../utils/env.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';

const logger = getLoggerFor({ module: 'treasury' });

const REFRESH_INTERVAL = envNumber('TREASURY_REFRESH_INTERVAL', 1000 * 60);

// treasury addresses that should be queried for balances
let treasuryAddressesByChain: TreasuryWalletRegistry;

// addressbook + vault tokens where balances should be queried
let assetsByChain: TreasuryAssetRegistry = keysToObject(SupportedChains, () => ({}));

let tokenBalancesByChain: TreasuryBalances = keysToObject(SupportedChains, () => ({}));

let treasurySummary: TreasuryReport = keysToObject(SupportedChains, () => ({}));

function updateTreasuryAddressesByChain() {
  treasuryAddressesByChain = keysToObject(SupportedChains, chain => {
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

  assetsByChain = keysToObject(SupportedChains, chain => {
    return {
      ...(tokenAssets[chain] || {}),
      ...(vaultAssets[chain] || {}),
    };
  });
}

async function updateSingleChainTreasuryBalance(chain: ApiChain) {
  try {
    // Don't let any one update take longer than the refresh interval
    return await withTimeout(
      updateSingleChainTreasuryBalanceImpl(chain),
      Math.floor(REFRESH_INTERVAL * 0.99),
      `updateSingleChainTreasuryBalance(${chain})`
    );
  } catch (err) {
    logger.warn({ chain, err }, 'error updating treasury balances');
    throw err;
  }
}

async function updateSingleChainTreasuryBalanceImpl(chain: ApiChain) {
  const assetsToCheck = Object.values(assetsByChain[chain]);
  const treasuryAddressesForChain = Object.values(treasuryAddressesByChain[chain]);

  const assetCalls = assetsToCheck.map(asset =>
    Promise.all(mapAssetToCall(asset, treasuryAddressesForChain, chainIdMap[chain]))
  );
  const callResults = await Promise.allSettled(assetCalls);
  const failedCalls = callResults.filter(res => res.status === 'rejected').length;
  const hasOneFailedCall = failedCalls > 0;
  if (hasOneFailedCall) {
    logger.warn(
      { chain, failed: failedCalls, total: callResults.length },
      'treasury update had at least one failed call'
    );
  }
  const balancesForChain = {};
  treasuryAddressesForChain.forEach((treasuryData: any) => {
    balancesForChain[treasuryData.address.toLowerCase()] = {};
  });

  //If we have at least one failed call, we keep the previous cache, if not we purge outdated values
  tokenBalancesByChain[chain] = {
    ...(tokenBalancesByChain[chain] && hasOneFailedCall ? tokenBalancesByChain[chain] : {}),
    ...extractBalancesFromTreasuryCallResults(
      assetsToCheck,
      treasuryAddressesForChain.map(t => t.address),
      callResults
    ),
  };
}

async function updateTreasuryBalances() {
  try {
    logger.debug('updating treasury balances');
    const start = Date.now();

    const chainResults = await contextAllSettled(SupportedChains, updateSingleChainTreasuryBalance);
    await buildTreasuryReport();
    await saveToRedis();

    logger.info({ durationMs: Date.now() - start }, 'treasury balances updated');

    const rejectedChains = chainResults.filter(isContextResultRejected).map(r => r.context);
    if (rejectedChains.length > 0) {
      logger.warn({ count: rejectedChains.length, chains: rejectedChains }, 'chains rejected update');
    }
  } catch (err) {
    logger.warn({ err }, 'error updating treasury');
  } finally {
    setTimeout(() => {
      updateTreasuryBalances();
    }, REFRESH_INTERVAL);
  }
}

async function buildTreasuryReport() {
  const chainReports = await Promise.all(SupportedChains.map(buildTreasuryReportForChain));
  for (const i in SupportedChains) {
    treasurySummary[SupportedChains[i]] = chainReports[i];
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
          const key = isValidatorAsset(treasuryAsset) ? treasuryAsset.id : treasuryAsset.address;
          balanceReport[treasuryWallet].balances[key] = {
            ...treasuryAsset,
            price,
            usdValue: usdValue.toString(10),
            balance: balance.toString(10),
          };
        }
      } catch (err) {
        logger.warn({ chain, asset: treasuryAsset.name, err }, 'error setting treasury balance');
      }
    }
  }

  return balanceReport;
}

function findUsdValueForBalance(tokenInfo: TreasuryAsset, tokenPrice: number, balance: BigNumber): BigNumber {
  if (isVaultAsset(tokenInfo) || isGovAsset(tokenInfo)) {
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
