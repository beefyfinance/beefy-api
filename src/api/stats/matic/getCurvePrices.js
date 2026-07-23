import { POLYGON_CHAIN_ID } from '../../../constants.ts';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.js';
import pools from '../../../data/matic/curvePools.json' with { type: 'json' };

const getCurvePolygonPrices = async tokenPrices => {
  return await getCurvePricesCommon(POLYGON_CHAIN_ID, pools, tokenPrices);
};

export default getCurvePolygonPrices;
