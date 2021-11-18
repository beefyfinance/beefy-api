import { avaxWeb3 } from '../../../utils/web3';
import { getSwapPrices } from '../common/swap/getSwapPrices';
import { SingleAssetPool } from '../../../types/LpPool';

import _pools from '../../../data/avax/synapsePools.json';
const pools: SingleAssetPool[] = _pools;

export const getSynapsePrices = async () => {
  return getSwapPrices({
    web3: avaxWeb3,
    pools,
  });
};
