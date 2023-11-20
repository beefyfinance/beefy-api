import { ApiChain } from '../../utils/chain';
import { ConcLiquidityAsset } from './types';

export const treasuryConcLiquidityAssets: Partial<Record<ApiChain, ConcLiquidityAsset[]>> = {
  arbitrum: [
    {
      name: 'USDC-USDC.e V3',
      //Since we can have multiple positions, we chain the nft id to the address (as the address is used as the key)
      address: '0x8e295789c9465487074a65b1ae9Ce0351172393f-663650',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'uniswap-arbitrum-usdc-usdce-0.01',
      id: 663650,
    },
  ],
  ethereum: [
    {
      name: 'BIFI-ETH V3',
      address: '0xfba26c3f9c8ecef989def3c5c8ad037487462d83-588941',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'uniswap-ethereum-bifi-eth-0.3',
      id: 588941,
    },
    {
      name: 'BIFI-ETH V3',
      address: '0xfba26c3f9c8ecef989def3c5c8ad037487462d83-605204',
      decimals: 18,
      assetType: 'concLiquidity',
      oracleType: 'lps',
      oracleId: 'uniswap-ethereum-bifi-eth-0.3-tight',
      id: 605204,
    },
  ],
};

export const hasChainConcentratedLiquidityAssets = (chain: ApiChain) =>
  !!treasuryConcLiquidityAssets[chain];
export const getChainConcentratedLiquidityAssets = (chain: ApiChain) =>
  treasuryConcLiquidityAssets[chain];
