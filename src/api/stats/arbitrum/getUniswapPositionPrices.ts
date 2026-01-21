import { getUniV3PositionPrices } from '../common/getUniV3PositionPrices';
import pools from '../../../data/arbitrum/uniswapLpPools.json';

export default async function getUniswapPositionPrices(tokenPrices: Record<string, number>) {
  const params = {
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: 42161,
    beefyHelper: '0x9a7006E936f5aBe8E0FAf24068e1e120fB0DB79e',
    nftManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  };

  return await getUniV3PositionPrices(params);
}
