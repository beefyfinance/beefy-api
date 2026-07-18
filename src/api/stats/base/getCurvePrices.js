import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.js';
import pools from '../../../data/base/curvePools.json' with { type: "json" };
import { BASE_CHAIN_ID as chainId }from '../../../constants.ts';

export const getCurveBasePrices = async tokenPrices => {
  return await getCurvePricesCommon(chainId, pools, tokenPrices);
};
