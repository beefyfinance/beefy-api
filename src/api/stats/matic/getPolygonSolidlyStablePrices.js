const { polygonWeb3: web3 } = require('../../../utils/web3');
const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');

const pools = [
  ...require('../../../data/matic/dystopiaStableLpPools.json'),
  ...require('../../../data/matic/pearlStableLpPools.json'),
];

export const getPolygonSolidlyStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};
