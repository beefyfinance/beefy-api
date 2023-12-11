const getStargatePrices = require('../common/getStargatePrices');
const { LINEA_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/linea/stargateLineaPools.json');

const getStargateLineaPrices = async tokenPrices => {
  return await getStargatePrices(chainId, pools, tokenPrices);
};

module.exports = getStargateLineaPrices;
