import { ETH_CHAIN_ID } from '../../../constants.ts';
import type { PricesById } from '../../../types/prices.ts';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.ts';
import convexPoolsData from '../../../data/ethereum/convexPools.json' with { type: 'json' };
import fxPoolsData from '../../../data/ethereum/fxPools.json' with { type: 'json' };
import usualCurvePoolsData from '../../../data/ethereum/usualCurvePools.json' with { type: 'json' };

const pools = [...convexPoolsData, ...fxPoolsData, ...usualCurvePoolsData];

export const getCurveEthereumPrices = async (tokenPrices: PricesById) => {
  return await getCurvePricesCommon(ETH_CHAIN_ID, pools, tokenPrices);
};
