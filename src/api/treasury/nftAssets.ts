import type { ApiChain } from '../../utils/chain.ts';
import type { ConcLiquidityAsset } from './types.ts';

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
    {
      name: 'BIFI-ETH Aero V3',
      address: '0xff35aa95669b5668AC6727FdcFc0D5582cdd78D1-3147',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'aero-cl-ethereum-bifi-weth-3147',
      id: 3147,
    },
    {
      name: 'BIFI-ETH Aero V3',
      address: '0xff35aa95669b5668AC6727FdcFc0D5582cdd78D1-3171',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'aero-cl-ethereum-bifi-weth-3171',
      id: 3171,
    },
  ],
};

export const hasChainConcentratedLiquidityAssets = (chain: ApiChain) => !!treasuryConcLiquidityAssets[chain];
export const getChainConcentratedLiquidityAssets = (chain: ApiChain) => treasuryConcLiquidityAssets[chain];
