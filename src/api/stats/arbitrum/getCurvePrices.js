import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.js';
import pools from '../../../data/arbitrum/curvePools.json' with { type: "json" };
import { ARBITRUM_CHAIN_ID } from '../../../constants.ts';

const getCurveArbitrumPrices = async tokenPrices => {
  return await getCurvePricesCommon(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

export default getCurveArbitrumPrices;
