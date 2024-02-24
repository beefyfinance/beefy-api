const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/linea/lynexStablePools.json');
const { LINEA_CHAIN_ID: chainId } = require('../../../constants');

const getLynexStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};

module.exports = getLynexStablePrices;
