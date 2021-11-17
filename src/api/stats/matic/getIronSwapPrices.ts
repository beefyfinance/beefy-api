import { polygonWeb3 } from '../../../utils/web3';
import { getSwapPrices } from '../common/swap/getSwapPrices';
import { SingleAssetPool } from '../../../types/LpPool';

import _pools from '../../../data/matic/ironSwapPools.json';
const pools: SingleAssetPool[] = _pools;

export const getIronSwapPrices = async () => {
  return getSwapPrices({
    web3: polygonWeb3,
    pools,
  });
};
