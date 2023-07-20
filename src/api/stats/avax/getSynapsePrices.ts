import { getSwapPrices } from '../common/swap/getSwapPrices';
import { SingleAssetPool } from '../../../types/LpPool';

import _pools from '../../../data/avax/synapsePools.json';
import { AVAX_CHAIN_ID } from '../../../constants';
const pools: SingleAssetPool[] = _pools;

export const getSynapsePrices = async () => {
  return getSwapPrices({
    chainId: AVAX_CHAIN_ID,
    pools,
  });
};
