import { ARBITRUM_CHAIN_ID } from '../../../constants.ts';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.js';
import pools from '../../../data/arbitrum/curvePools.json' with { type: 'json' };

const getCurveArbitrumPrices = async tokenPrices => {
  return await getCurvePricesCommon(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

export default getCurveArbitrumPrices;
