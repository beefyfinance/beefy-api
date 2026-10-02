import type { PricesById } from '../../../types/prices.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.ts';
import pools from '../../../data/matic/curvePools.json' with { type: 'json' };

const getCurvePolygonPrices = async (tokenPrices: PricesById) => {
  return await getCurvePricesCommon(ApiChainId.polygon, pools, tokenPrices);
};

export default getCurvePolygonPrices;
