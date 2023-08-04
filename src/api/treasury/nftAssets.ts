import { ApiChain } from '../../utils/chain';
import { ConcLiquidityAsset } from './types';

export const treasuryConcLiquidityAssets: Partial<Record<ApiChain, ConcLiquidityAsset[]>> = {
  arbitrum: [
    {
      name: 'USDC-USDC.e V3',
      address: '0x8e295789c9465487074a65b1ae9Ce0351172393f',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'uniswap-arbitrum-usdc-usdce-0.01',
      id: 663650,
    },
  ],
};

export const hasChainConcentratedLiquidityAssets = (chain: ApiChain) =>
  !!treasuryConcLiquidityAssets[chain];
export const getChainConcentratedLiquidityAssets = (chain: ApiChain) =>
  treasuryConcLiquidityAssets[chain];
