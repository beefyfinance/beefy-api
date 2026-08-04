import { OPTIMISM_CHAIN_ID } from '../../../constants.ts';
import type { PricesById } from '../../../types/prices.ts';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.ts';
import pools from '../../../data/optimism/curvePools.json' with { type: 'json' };

const getCurveOptimismPrices = async (tokenPrices: PricesById) => {
  return await getCurvePricesCommon(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

export default getCurveOptimismPrices;
