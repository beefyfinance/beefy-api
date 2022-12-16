import BigNumber from 'bignumber.js';
import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall';
import { pick } from 'lodash';
import { addressBook } from '../../../packages/address-book/address-book';
import chainIdMap from '../../../packages/address-book/util/chainIdMap';
import { ERC20_ABI } from '../../abis/common/ERC20';
import fetchPrice from '../../utils/fetchPrice';
import { web3Factory } from '../../utils/web3';
const { getMultichainVaults } = require('../stats/getMultichainVaults');

import { getAllTokens } from '../tokens/getTokens';
import { extractBalancesFromTreasuryMulticallResults, mapAssetToCall } from './multicallUtils';
import {
  Asset,
  TreasuryAsset,
  TreasuryAssetRegistry,
  TreasuryBalances,
  TreasuryWalletRegistry,
  VaultAsset,
} from './types';

const INIT_DELAY = 90000;

const MULTICALL_BATCH_SIZE = 1024;

//treasury addresses that should be queried for balances
let treasuryAddressesByChain: TreasuryWalletRegistry;

//addressbook + vault tokens where balances should be queried
let assetsByChain: TreasuryAssetRegistry;

let tokenBalancesByChain: TreasuryBalances = {};

let treasurySummary;

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
          oracleId: key,
          oracleType: 'tokens',
          assetType: 'token',
        };
      }
    }
  });
  return tokensByChain;
};

// Periodically update vault deposit tokens and mooTokens
const updateVaultTokenAddresses = () => {
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

  const contractCallContext: ContractCallContext[] = assetsToCheck.flatMap((asset: TreasuryAsset) =>
    mapAssetToCall(asset, treasuryAddressesForChain, multicallAddress)
  );
  const promises: Promise<ContractCallResults>[] = [];

  for (let i = 0; i < contractCallContext.length; i += MULTICALL_BATCH_SIZE) {
    const batch = contractCallContext.slice(i, i + MULTICALL_BATCH_SIZE);
    promises.push(multicall.call(batch));
  }

  try {
    const results = await Promise.allSettled(promises);

    const balancesForChain = {};
    treasuryAddressesForChain.forEach((treasuryData: any) => {
      balancesForChain[treasuryData.address.toLowerCase()] = {};
    });

    const fulfilledResults = Object.fromEntries(
      results
        .filter(res => res.status === 'fulfilled')
        .flatMap((res: PromiseFulfilledResult<ContractCallResults>) =>
          Object.entries(res.value.results)
        )
    );

    if (Object.keys(fulfilledResults).length !== contractCallContext.length) {
      console.log('> Multicall batch failed fetching balances for treasury on ' + chain);
    }

    tokenBalancesByChain[chain] = extractBalancesFromTreasuryMulticallResults(fulfilledResults);
  } catch (err) {
    console.log('error updating treasury balances on chain ' + chain);
  }
};

const updateTreasuryBalances = async () => {
  console.log('> updating treasury balances');
  const start = Date.now();
  let promises = [];

  for (const chain of Object.keys(treasuryAddressesByChain)) {
    promises.push(updateSingleChainTreasuryBalance(chain));
  }

  await Promise.allSettled(promises);
  console.log(`> treasury balances updated (${((Date.now() - start) / 1000).toFixed(2)}s)`);

  buildTreasuryReport();
};

const buildTreasuryReport = async () => {
  const balanceReport = {};

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

    for (const assetBalance of chainBalancesByAddress) {
      const treasuryAsset = assetsByChain[chain][assetBalance.address];
      const price = await fetchPrice({
        oracle: treasuryAsset.oracleType,
        id: treasuryAsset.oracleId,
      });

      for (const [treasuryWallet, balance] of Object.entries(assetBalance.balances)) {
        if (balance.gt(0)) {
          const usdValue = findUsdValueForBalance(treasuryAsset, price, balance);
          balanceReport[chain][treasuryWallet].balances[treasuryAsset.address] = {
            ...treasuryAsset,
            price,
            usdValue: usdValue.toString(10),
            balance: balance.toString(10),
          };
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

export const initTreasuryService = async () => {
  //Fetch treasury addresses, this are infered from the addressbook so no need to update till api restarts
  treasuryAddressesByChain = getTreasuryAddressesByChain();
  //Again, initialize from addressbook, only done once
  assetsByChain = getTokenAddressesByChain();

  setTimeout(() => {
    console.log('updating treasury vault addresses');

    updateVaultTokenAddresses();
    updateTreasuryBalances();
  }, INIT_DELAY);
};

export const getBeefyTreasury = () => {
  return treasurySummary;
};
