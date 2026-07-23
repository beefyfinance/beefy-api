import { ETH_CHAIN_ID } from '../../../constants.ts';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.js';
import convexPoolsData from '../../../data/ethereum/convexPools.json' with { type: 'json' };
import fxPoolsData from '../../../data/ethereum/fxPools.json' with { type: 'json' };
import usualCurvePoolsData from '../../../data/ethereum/usualCurvePools.json' with { type: 'json' };

const pools = [...convexPoolsData, ...fxPoolsData, ...usualCurvePoolsData];

export const getCurveEthereumPrices = async tokenPrices => {
  return await getCurvePricesCommon(ETH_CHAIN_ID, pools, tokenPrices);
};
