import type { ApiChain } from '../../utils/chain.ts';
import type { ConcLiquidityAsset } from './types.ts';

export const treasuryConcLiquidityAssets: Partial<Record<ApiChain, ConcLiquidityAsset[]>> = {
  ethereum: [
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
    {
      name: 'BIFI-ETH Aero V3',
      address: '0xff35aa95669b5668AC6727FdcFc0D5582cdd78D1-18362',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'aero-cl-ethereum-bifi-weth-18362',
      id: 18362,
    },
    {
      name: 'BIFI-ETH Aero V3',
      address: '0xff35aa95669b5668AC6727FdcFc0D5582cdd78D1-18369',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'aero-cl-ethereum-bifi-weth-18369',
      id: 18369,
    },
    {
      name: 'BIFI-ETH Aero V3',
      address: '0xff35aa95669b5668AC6727FdcFc0D5582cdd78D1-18378',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'aero-cl-ethereum-bifi-weth-18378',
      id: 18378,
    },
  ],
};

export const hasChainConcentratedLiquidityAssets = (chain: ApiChain) => !!treasuryConcLiquidityAssets[chain];
export const getChainConcentratedLiquidityAssets = (chain: ApiChain) => treasuryConcLiquidityAssets[chain];
