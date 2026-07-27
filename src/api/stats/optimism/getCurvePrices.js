import { OPTIMISM_CHAIN_ID } from '../../../constants.ts';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.js';
import pools from '../../../data/optimism/curvePools.json' with { type: 'json' };

const getCurveOptimismPrices = async tokenPrices => {
  return await getCurvePricesCommon(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

export default getCurveOptimismPrices;
