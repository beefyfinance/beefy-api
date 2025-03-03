import { ApiChain } from '../../utils/chain';
import { fetchContract } from '../rpc/client';
import { LockedAsset, TreasuryAsset } from './types';

const onChainLockedAssets: Partial<Record<ApiChain, LockedAsset[]>> = {
  sonic: [
    {
      address: '0x5050bc082FF4A74Fb6B0B04385dEfdDB114b2424',
      name: 'xSHADOW',
      oracleId: 'xSHADOW',
      oracleType: 'tokens',
      decimals: 18,
      symbol: 'xShadow',
      method: 'xshadow-contract',
      methodPath: '0xDCB5A24ec708cc13cee12bFE6799A78a79b666b4',
      assetType: 'locked-token',
      staked: true,
    },
  ],
};

export const hasChainLockedAssets = (chain: ApiChain): boolean => !!onChainLockedAssets[chain];

export const getChainLockedAssets = (chain: ApiChain): LockedAsset[] => onChainLockedAssets[chain];

const ShadowVoteModuleAbi = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const fetchXShadowBalance = async (
  asset: LockedAsset,
  chainId: number,
  treasuryAddress: string
): Promise<bigint> => {
  const contract = fetchContract(asset.methodPath, ShadowVoteModuleAbi, chainId);
  const xShadowBalance = await contract.read.balanceOf([treasuryAddress as `0x${string}`]);
  return xShadowBalance;
};

export const getLockedAssetBalanceCall = (asset: LockedAsset, chainId: number, treasuryAddress: string) => {
  return fetchXShadowBalance(asset, chainId, treasuryAddress);
};
