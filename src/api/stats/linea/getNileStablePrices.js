const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/linea/nileStablePools.json');
const { LINEA_CHAIN_ID: chainId } = require('../../../constants');

const getNileStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};

module.exports = getNileStablePrices;
