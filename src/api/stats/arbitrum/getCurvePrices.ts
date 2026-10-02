import type { PricesById } from '../../../types/prices.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.ts';
import pools from '../../../data/arbitrum/curvePools.json' with { type: 'json' };

const getCurveArbitrumPrices = async (tokenPrices: PricesById) => {
  return await getCurvePricesCommon(ApiChainId.arbitrum, pools, tokenPrices);
};

export default getCurveArbitrumPrices;
