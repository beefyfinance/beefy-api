import { ApiChain } from '../../utils/chain';
import { ConcLiquidityAsset } from './types';

export const treasuryConcLiquidityAssets: Partial<Record<ApiChain, ConcLiquidityAsset[]>> = {
  ethereum: [
    {
      name: 'BIFI-ETH V3',
      address: '0xfba26c3f9c8ecef989def3c5c8ad037487462d83-697353',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'uniswap-ethereum-bifi-eth-0.3',
      id: 697353,
    },
    {
      name: 'BIFI-ETH V3',
      address: '0xfba26c3f9c8ecef989def3c5c8ad037487462d83-697355',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'uniswap-ethereum-bifi-eth-0.3-tight',
      id: 697355,
    },
    {
      name: 'BIFI-ETH V3',
      address: '0xfba26c3f9c8ecef989def3c5c8ad037487462d83-697697',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'uniswap-ethereum-bifi-eth-0.3-tighter',
      id: 697697,
    },
    {
      name: 'BIFI-ETH V3',
      address: '0xfba26c3f9c8ecef989def3c5c8ad037487462d83-747836',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'uniswap-ethereum-bifi-eth-0.3-tighter-1',
      id: 747836,
    },
    {
      name: 'BIFI-ETH V3',
      address: '0xfba26c3f9c8ecef989def3c5c8ad037487462d83-1005753',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'uniswap-ethereum-bifi-eth-0.3-tighter-2',
      id: 1005753,
    },
  ],
  sonic: [],
};

export const hasChainConcentratedLiquidityAssets = (chain: ApiChain) => !!treasuryConcLiquidityAssets[chain];
export const getChainConcentratedLiquidityAssets = (chain: ApiChain) => treasuryConcLiquidityAssets[chain];
