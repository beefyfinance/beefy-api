import { ETH_CHAIN_ID } from '../../../constants';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon';

const pools = [
  ...require('../../../data/ethereum/convexPools.json'),
  ...require('../../../data/ethereum/fxPools.json'),
  ...require('../../../data/ethereum/usualCurvePools.json'),
];

export const getCurveEthereumPrices = async tokenPrices => {
  return await getCurvePricesCommon(ETH_CHAIN_ID, pools, tokenPrices);
};
