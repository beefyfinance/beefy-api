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
import { Asset, TreasuryAssetRegistry, TreasuryWalletRegistry } from './types';

const INIT_DELAY = 90000;

const MULTICALL_BATCH_SIZE = 1024;

//treasury addresses that should be queried for balances
let treasuryAddressesByChain: TreasuryWalletRegistry;

//addressbook + vault tokens where balances should be queried
let assetsByChain: TreasuryAssetRegistry;

let tokenBalancesByChain = {};

let treasurySummary;

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

const getTokenAddressesByChain = (): TreasuryAssetRegistry => {
  const addressbookTokens = getAllTokens();
  const tokensByChain: TreasuryAssetRegistry = {};
  Object.keys(addressbookTokens).forEach(chain => {
    const chainAddressbook = addressbookTokens[chain];
    tokensByChain[chain] = {};

    for (const [key, token] of Object.entries(chainAddressbook)) {
      const asset: Asset = {
        ...pick(token, ['name', 'address', 'decimals']),
        oracleId: key === 'WNATIVE' ? token.symbol : key,
        oracleType: 'tokens',
        assetType: 'token',
      };
      tokensByChain[chain][token.address.toLowerCase()] = asset;
    }
  });
  return tokensByChain;
};

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
        decimals: 18,
        pricePerFullShare: vault.pricePerFullShare,
        address: vault.earnContractAddress,
      };
    });
  });
};

const updateSingleChainTreasuryBalance = async chain => {
  const tokensToCheck = Object.values(assetsByChain[chain]);
  const web3 = web3Factory(chainIdMap[chain]);
  const treasuryAddressesForChain = Object.values(treasuryAddressesByChain[chain]);
  const multicall = new Multicall({
    web3Instance: web3,
    tryAggregate: true,
    multicallCustomContractAddress:
      chainIdMap[chain] === 2222
        ? '0xdAaD0085e5D301Cb5721466e600606AB5158862b'
        : '0xcA11bde05977b3631167028862bE2a173976CA11',
  });

  const contractCallContext: ContractCallContext[] = [];

  tokensToCheck.forEach((token: any) => {
    contractCallContext.push({
      reference: token.address.toLowerCase(),
      contractAddress: token.address,
      abi: ERC20_ABI,
      calls: treasuryAddressesForChain.map((treasuryData: any) => ({
        reference: treasuryData.address.toLowerCase(),
        methodName: 'balanceOf',
        methodParameters: [treasuryData.address],
      })),
    });
  });

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

    results.forEach(res => {
      if (res.status === 'fulfilled') {
        let mappedResults = mapMulticallResults(res.value);
        mappedResults.forEach(res => {
          const tokenAddress = res.address;
          Object.entries(res.balances).forEach(([treasuryAddress, balance]: any[]) => {
            if (balance.gt(0)) {
              balancesForChain[treasuryAddress][tokenAddress] = balance;
            }
          });
        });
      } else {
      }
    });

    tokenBalancesByChain[chain] = balancesForChain;
  } catch (err) {
    console.log('error updating treasury balances on chain ' + chain);
  }
};

const mapMulticallResults = (results: ContractCallResults) => {
  return Object.entries(results.results).map(([address, result]) => {
    const mappedObject = {
      address,
      balances: {},
    };
    result.callsReturnContext.forEach(callReturn => {
      if (callReturn.decoded) {
        mappedObject.balances[callReturn.reference] = new BigNumber(callReturn.returnValues[0].hex);
      }
    });
    return mappedObject;
  });
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
    for (const [treasuryAddress, balances] of Object.entries(chainBalancesByAddress)) {
      const treasuryDetails = treasuryAddressesByChain[chain][treasuryAddress];
      balanceReport[chain][treasuryAddress] = {
        name: treasuryDetails.label,
        balances: {},
      };
      for (const [tokenAddress, balance] of Object.entries(balances)) {
        const tokenInfo = assetsByChain[chain][tokenAddress];
        const tokenPrice = await fetchPrice({
          oracle: tokenInfo.oracleType,
          id: tokenInfo.oracleId,
        });

        const balanceUsdValue = findUsdValueForBalance(tokenInfo, tokenPrice, balance);
        balanceReport[chain][treasuryAddress].balances[tokenAddress] = {
          ...tokenInfo,
          price: tokenPrice,
          usdValue: (balanceUsdValue as BigNumber).toString(10),
          balance: (balance as BigNumber).toString(10),
        };
      }
    }
  }
  treasurySummary = balanceReport;
};

const findUsdValueForBalance = (tokenInfo, tokenPrice, balance) => {
  if (tokenInfo.assetType === 'token') {
    return balance.multipliedBy(tokenPrice).shiftedBy(-tokenInfo.decimals);
  } else if (tokenInfo.assetType === 'vault') {
    return balance
      .multipliedBy(tokenPrice)
      .multipliedBy(tokenInfo.pricePerFullShare)
      .shiftedBy(-18)
      .shiftedBy(-tokenInfo.decimals);
  } else {
    console.log('UNKNOWN BALANCE INTENT');
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
