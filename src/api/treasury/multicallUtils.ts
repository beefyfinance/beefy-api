import BigNumber from 'bignumber.js';
import {
  AssetBalance,
  ChainTreasuryBalance,
  isConcLiquidityAsset,
  isNativeAsset,
  isTokenAsset,
  isValidatorAsset,
  isVaultAsset,
  TreasuryApiResult,
  TreasuryAsset,
  TreasuryWallet,
} from './types';
import { getLpBreakdownForOracle, LpBreakdown } from '../stats/getAmmPrices';
import { fetchContract } from '../rpc/client';
import ERC20Abi from '../../abis/ERC20Abi';
import { MULTICALL_V3 } from '../../utils/web3Helpers';
import MulticallAbi from '../../abis/common/Multicall/MulticallAbi';
import { fetchAPIValidatorBalance, fetchSonicValidatorBalance, isSonicValidator } from './validatorHelpers';

export const mapAssetToCall = (
  asset: TreasuryAsset,
  treasuryAddressesForChain: TreasuryWallet[],
  chainId: number
) => {
  if (isTokenAsset(asset) || isVaultAsset(asset)) {
    const contract = fetchContract(asset.address, ERC20Abi, chainId);
    return treasuryAddressesForChain.map(treasuryData =>
      contract.read.balanceOf([treasuryData.address as `0x${string}`])
    );
  } else if (isNativeAsset(asset)) {
    const multicallContract = fetchContract(MULTICALL_V3[chainId], MulticallAbi, chainId);
    return treasuryAddressesForChain.map(treasuryData =>
      multicallContract.read.getEthBalance([treasuryData.address as `0x${string}`])
    );
  } else if (isConcLiquidityAsset(asset)) {
    return [getLpBreakdownForOracle(asset.oracleId)];
  } else if (isValidatorAsset(asset)) {
    if (isSonicValidator(asset)) {
      return [fetchSonicValidatorBalance(asset, chainId)];
    } else {
      return [fetchAPIValidatorBalance(asset)];
    }
  }
};

export const extractBalancesFromTreasuryCallResults = (
  apiAssets: TreasuryAsset[],
  treasuryAddresses: string[],
  callResults: PromiseSettledResult<bigint[] | LpBreakdown[] | TreasuryApiResult[]>[]
): ChainTreasuryBalance => {
  const allBalances: AssetBalance[] = [];
  apiAssets.forEach((asset, i) => {
    if (callResults[i].status === 'fulfilled') {
      const callResult = callResults[i] as PromiseFulfilledResult<
        bigint[] | LpBreakdown[] | TreasuryApiResult[]
      >;
      if (isTokenAsset(asset) || isVaultAsset(asset) || isNativeAsset(asset)) {
        const value = callResult.value as bigint[];
        const bal = {
          address: asset.address.toLowerCase(),
          balances: {},
        };
        treasuryAddresses.forEach((treasuryAddress, j) => {
          bal.balances[treasuryAddress.toLowerCase()] = new BigNumber(value[j].toString());
        });
        allBalances.push(bal);
      } else if (isValidatorAsset(asset)) {
        if (asset.method === 'sonic-contract') {
          const value = callResult.value as bigint[];
          allBalances.push({
            address: asset.id,
            balances: {
              ['validators']: new BigNumber(value[0].toString()),
            },
          });
        } else {
          const value = callResult.value as TreasuryApiResult[];
          allBalances.push({
            address: asset.id,
            balances: {
              ['validators']: value[0].balance,
            },
          });
        }
      } else if (isConcLiquidityAsset(asset)) {
        const value = callResult.value as LpBreakdown[];
        allBalances.push({
          address: asset.address.toLowerCase(),
          balances: {
            [treasuryAddresses[0].toLowerCase()]: new BigNumber(value[0].totalSupply).shiftedBy(18),
          },
        });
      } else {
        console.warn('Unknown treasury asset type:', asset);
      }
    }
  });
  return allBalances.reduce((all, cur) => ((all[cur.address] = cur), all), {});
};
