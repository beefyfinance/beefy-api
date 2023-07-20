import { ETH_CHAIN_ID } from '../../../constants';
const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const pools = require('../../../data/ethereum/convexPools.json');

export const getCurveEthereumPrices = async tokenPrices => {
  return await getCurvePricesCommon(ETH_CHAIN_ID, pools, tokenPrices);
};
