const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/linea/etherexStablePools.json');
const { LINEA_CHAIN_ID: chainId } = require('../../../constants');

const getEtherexStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};

module.exports = getEtherexStablePrices;
