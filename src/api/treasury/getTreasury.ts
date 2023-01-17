import BigNumber from 'bignumber.js';
import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall';
import { chunk, partition, pick, result } from 'lodash';
import { addressBook } from '../../../packages/address-book/address-book';
import chainIdMap from '../../../packages/address-book/util/chainIdMap';
import fetchPrice from '../../utils/fetchPrice';
import { getKey, setKey } from '../../utils/redisHelper';
import { web3Factory } from '../../utils/web3';
const { getMultichainVaults } = require('../stats/getMultichainVaults');

import { getAllTokens } from '../tokens/getTokens';
import {
  extractBalancesFromTreasuryApiCallResults,
  extractBalancesFromTreasuryMulticallResults,
  fetchAPIBalance,
  mapAssetToCall,
} from './multicallUtils';
import {
  isValidatorAsset,
  TreasuryApiResult,
  TreasuryAsset,
  TreasuryAssetRegistry,
  TreasuryBalances,
  TreasuryReport,
  TreasuryWalletRegistry,
  ValidatorAsset,
  VaultAsset,
} from './types';
import { getChainValidator, hasChainValidator } from './validatorHelpers';

const INIT_DELAY = 90000;
const REFRESH_INTERVAL = 60000 * 10;

const MULTICALL_BATCH_SIZE = 1024;

//treasury addresses that should be queried for balances
let treasuryAddressesByChain: TreasuryWalletRegistry;

//addressbook + vault tokens where balances should be queried
let assetsByChain: TreasuryAssetRegistry;

let tokenBalancesByChain: TreasuryBalances = {};

let treasurySummary: TreasuryReport;

// Load treasury wallets from addressbook
const getTreasuryAddressesByChain = (): TreasuryWalletRegistry => {
  const addressesByChain: TreasuryWalletRegistry = {};

  Object.entries(addressBook).map(([chain, chainAddressbook]) => {
    addressesByChain[chain] = {};

    const treasuryMultisig = chainAddressbook.platforms.beefyfinance.treasuryMultisig;
    const treasury = chainAddressbook.platforms.beefyfinance.treasury;

    if (treasuryMultisig !== '0x0000000000000000000000000000000000000000') {
      addressesByChain[chain][treasuryMultisig.toLowerCase()] = {
        address: treasuryMultisig,
        label: 'treasuryMultisig',
      };
    }

    // Add treasury only if different from multisig
    if (!addressesByChain[chain][treasury.toLowerCase()]) {
      addressesByChain[chain][treasury.toLowerCase()] = {
        address: treasury,
        label: 'treasury',
      };
    }
  });

  return addressesByChain;
};

// Load token addres
const getTokenAddressesByChain = (): TreasuryAssetRegistry => {
  const addressbookTokens = getAllTokens();
  const tokensByChain: TreasuryAssetRegistry = {};
  Object.keys(addressbookTokens).forEach(chain => {
    const chainAddressbook = addressbookTokens[chain];
    tokensByChain[chain] = {};

    for (const [key, token] of Object.entries(chainAddressbook)) {
      if (key === 'WNATIVE') {
        if (token.symbol === 'WCELO' || token.symbol === 'WMETIS') continue;
        // CELO and WCELO are the same token, avoid adding native celo as well
        // Add gas token
        tokensByChain[chain]['native'] = {
          name: token.symbol.slice(1),
          address: 'native',
          decimals: 18,
          assetType: 'native',
          oracleType: 'tokens',
          oracleId: token.symbol.slice(1),
        };
      } else {
        tokensByChain[chain][token.address.toLowerCase()] = {
          ...pick(token, ['name', 'address', 'decimals']),
          oracleId: token.oracleId ?? key,
          oracleType: token.oracle ?? 'tokens',
          assetType: 'token',
        };
      }
    }

    if (hasChainValidator(chain)) {
      tokensByChain[chain]['validator'] = getChainValidator(chain);
    }
  });
  return tokensByChain;
};

// Periodically update vault deposit tokens and mooTokens
const updateVaultTokenAddresses = () => {
  console.log('updating treasury vault addresses');
  const vaults = getMultichainVaults();
  Object.keys(assetsByChain).forEach(chain => {
    //App and API name harmony differently
    const normalizedChainName = chain === 'one' ? 'harmony' : chain;

    const chainVaults = vaults.filter(vault => vault.chain === normalizedChainName);
    const chainTokens = assetsByChain[chain];

    chainVaults.forEach(vault => {
      // if vault receives native input, field will be missing in vault object
      if (vault.tokenAddress) {
        const depositTokenAddress = vault.tokenAddress.toLowerCase();
        if (!chainTokens[depositTokenAddress]) {
          chainTokens[depositTokenAddress] = {
            oracleId: vault.oracleId,
            oracleType: vault.oracle,
            assetType: 'token',
            decimals: vault.tokenDecimals,
            name: vault.token,
            address: vault.tokenAddress,
          };
        }
      }

      const vaultAddress = vault.earnContractAddress.toLowerCase();
      chainTokens[vaultAddress] = {
        name: vault.earnedToken,
        oracleId: vault.oracleId,
        oracleType: vault.oracle,
        assetType: 'vault',
        vaultId: vault.id,
        decimals: vault.tokenDecimals,
        pricePerFullShare: vault.pricePerFullShare,
        address: vault.earnContractAddress,
      };
    });
  });
};

const updateSingleChainTreasuryBalance = async (chain: string) => {
  const assetsToCheck = Object.values(assetsByChain[chain]);
  const web3 = web3Factory(chainIdMap[chain]);
  const treasuryAddressesForChain = Object.values(treasuryAddressesByChain[chain]);
  const multicallAddress =
    chainIdMap[chain] === 2222
      ? '0xdAaD0085e5D301Cb5721466e600606AB5158862b'
      : '0xcA11bde05977b3631167028862bE2a173976CA11';

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
    MULTICALL_BATCH_SIZE
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
};

const updateTreasuryBalances = async () => {
  try {
    console.log('> updating treasury balances');
    const start = Date.now();
    let promises = [];

    for (const chain of Object.keys(treasuryAddressesByChain)) {
      promises.push(updateSingleChainTreasuryBalance(chain));
    }

    await Promise.allSettled(promises);
    console.log(`> treasury balances updated (${((Date.now() - start) / 1000).toFixed(2)}s)`);

    buildTreasuryReport();

    await saveToRedis();
  } catch (err) {
    console.log(`> error updating treasury`);
  }

  setTimeout(() => {
    updateTreasuryBalances();
  }, REFRESH_INTERVAL);
};

const buildTreasuryReport = async () => {
  const balanceReport: TreasuryReport = {};

  for (const [chain, chainBalancesByAddress] of Object.entries(tokenBalancesByChain)) {
    balanceReport[chain] = {};
    const chainTreasuryWallets = treasuryAddressesByChain[chain];
    //Initialize wallet balances as 0;
    Object.entries(chainTreasuryWallets).forEach(([address, wallet]) => {
      balanceReport[chain][address] = {
        name: wallet.label,
        balances: {},
      };
    });

    for (const assetBalance of Object.values(chainBalancesByAddress)) {
      const treasuryAsset = assetsByChain[chain][assetBalance.address];

      if (treasuryAsset === undefined) {
        continue; //cached asset hasn't been deleted yet
      }

      const price = await fetchPrice(
        {
          oracle: treasuryAsset.oracleType,
          id: treasuryAsset.oracleId,
        },
        false
      );

      for (const [treasuryWallet, balance] of Object.entries(assetBalance.balances)) {
        try {
          if (balance.gt(0)) {
            //Add validator wallet if missing
            if (!balanceReport[chain][treasuryWallet]) {
              balanceReport[chain][treasuryWallet] = { name: treasuryWallet, balances: {} };
            }
            const usdValue = findUsdValueForBalance(treasuryAsset, price, balance);
            balanceReport[chain][treasuryWallet].balances[treasuryAsset.address] = {
              ...treasuryAsset,
              price,
              usdValue: usdValue.toString(10),
              balance: balance.toString(10),
            };
          }
        } catch (err) {
          console.log(
            `> error setting treasury balance on ${chain} for asset ${treasuryAsset.name}`
          );
        }
      }
    }
  }
  treasurySummary = balanceReport;
};

const findUsdValueForBalance = (
  tokenInfo: TreasuryAsset,
  tokenPrice: number,
  balance: BigNumber
): BigNumber => {
  if (tokenInfo.assetType === 'vault') {
    return balance
      .multipliedBy(tokenPrice)
      .multipliedBy((tokenInfo as VaultAsset).pricePerFullShare)
      .shiftedBy(-18)
      .shiftedBy(-tokenInfo.decimals);
  } else {
    return balance.multipliedBy(tokenPrice).shiftedBy(-tokenInfo.decimals);
  }
};

const saveToRedis = async () => {
  await setKey('TREASURY_BALANCES', tokenBalancesByChain);
  await setKey('TREASURY_REPORT', treasurySummary);
};

const restoreFromRedis = async () => {
  const cachedSummary = await getKey('TREASURY_REPORT');
  const cachedBalances = await getKey('TREASURY_BALANCES');
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
};

export const initTreasuryService = async () => {
  //Fetch treasury addresses, this are infered from the addressbook so no need to update till api restarts
  treasuryAddressesByChain = getTreasuryAddressesByChain();
  //Again, initialize from addressbook, only done once
  assetsByChain = getTokenAddressesByChain();

  restoreFromRedis();

  setTimeout(() => {
    updateVaultTokenAddresses();
    updateTreasuryBalances();
  }, INIT_DELAY);
};

export const getBeefyTreasury = (): TreasuryReport => {
  return treasurySummary;
};
