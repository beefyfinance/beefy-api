import type { PricesById } from '../../../types/prices.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.ts';
import pools from '../../../data/optimism/curvePools.json' with { type: 'json' };

const getCurveOptimismPrices = async (tokenPrices: PricesById) => {
  return await getCurvePricesCommon(ApiChainId.optimism, pools, tokenPrices);
};

export default getCurveOptimismPrices;
