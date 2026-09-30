import type { PricesById } from '../../../types/prices.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.ts';
import pools from '../../../data/base/curvePools.json' with { type: 'json' };

export const getCurveBasePrices = async (tokenPrices: PricesById) => {
  return await getCurvePricesCommon(ApiChainId.base, pools, tokenPrices);
};
