import { getUniV3PositionPrices } from '../common/getUniV3PositionPrices';
import pools from '../../../data/base/aerodromeClPools.json';

export default async function getAerodromePositionPrices(tokenPrices: Record<string, number>) {
  const params = {
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: 8453,
    beefyHelper: '0xA73E3bD2E38B291Ba8E56E9badD3F090694B7Ed2',
    nftManager: '0x827922686190790b37229fd06084350E74485b72',
  };

  return await getUniV3PositionPrices(params);
}
