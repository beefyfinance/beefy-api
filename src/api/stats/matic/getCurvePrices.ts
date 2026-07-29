import { POLYGON_CHAIN_ID } from '../../../constants.ts';
import type { PricesById } from '../../../types/prices.ts';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.ts';
import pools from '../../../data/matic/curvePools.json' with { type: 'json' };

const getCurvePolygonPrices = async (tokenPrices: PricesById) => {
  return await getCurvePricesCommon(POLYGON_CHAIN_ID, pools, tokenPrices);
};

export default getCurvePolygonPrices;
