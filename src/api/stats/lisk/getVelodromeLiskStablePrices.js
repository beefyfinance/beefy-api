import { LISK_CHAIN_ID } from '../../../constants.ts';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';
import pools from '../../../data/lisk/velodromeLiskStablePools.json' with { type: 'json' };

const getVelodromeLiskStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(LISK_CHAIN_ID, pools, tokenPrices);
};

export default getVelodromeLiskStablePrices;
