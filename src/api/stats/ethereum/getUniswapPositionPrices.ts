import { ApiChainId } from '../../../utils/chain.ts';
import { getUniV3PositionPrices } from '../common/getUniV3PositionPrices.ts';
import pools from '../../../data/ethereum/uniswapLpPools.json' with { type: 'json' };

export default async function getUniswapPositionPrices(tokenPrices: Record<string, number>) {
  return await getUniV3PositionPrices({
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: ApiChainId.ethereum,
    beefyHelper: '0x70FcD79981f16277513030400a1f9fBc32A64C83',
    nftManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  });
}
