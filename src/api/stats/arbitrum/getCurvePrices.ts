import { ARBITRUM_CHAIN_ID } from '../../../constants.ts';
import type { PricesById } from '../../../types/prices.ts';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.ts';
import pools from '../../../data/arbitrum/curvePools.json' with { type: 'json' };

const getCurveArbitrumPrices = async (tokenPrices: PricesById) => {
  return await getCurvePricesCommon(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

export default getCurveArbitrumPrices;
