import { getUniV3PositionPrices } from '../common/getUniV3PositionPrices';
import pools from '../../../data/ethereum/uniswapLpPools.json';

export default async function getUniswapPositionPrices(tokenPrices: Record<string, number>) {
  const params = {
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: 1,
    beefyHelper: '0x70FcD79981f16277513030400a1f9fBc32A64C83',
    nftManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  };

  return await getUniV3PositionPrices(params);
}
