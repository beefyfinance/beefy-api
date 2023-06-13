import { POLYGON_CHAIN_ID } from '../../../constants';
const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');

const pools = [
  ...require('../../../data/matic/dystopiaStableLpPools.json'),
  ...require('../../../data/matic/pearlStableLpPools.json'),
];

export const getPolygonSolidlyStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(POLYGON_CHAIN_ID, pools, tokenPrices);
};
