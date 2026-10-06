import { ApiChainId } from '../../../utils/chain.ts';
import { getUniV3PositionPrices } from '../common/getUniV3PositionPrices.ts';
import pools from '../../../data/base/aerodromeClPools.json' with { type: 'json' };

export default async function getAerodromePositionPrices(tokenPrices: Record<string, number>) {
  return await getUniV3PositionPrices({
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: ApiChainId.base,
    beefyHelper: '0xA73E3bD2E38B291Ba8E56E9badD3F090694B7Ed2',
    nftManager: '0x827922686190790b37229fd06084350E74485b72',
  });
}
