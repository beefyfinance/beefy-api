import { BASE_CHAIN_ID as chainId } from '../../../constants.ts';
import type { PricesById } from '../../../types/prices.ts';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.ts';
import pools from '../../../data/base/curvePools.json' with { type: 'json' };

export const getCurveBasePrices = async (tokenPrices: PricesById) => {
  return await getCurvePricesCommon(chainId, pools, tokenPrices);
};
