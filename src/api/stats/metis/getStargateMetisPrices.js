const getStargatePrices = require('../common/getStargatePrices');
const { METIS_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/metis/stargateMetisPools.json');

const getStargateMetisPrices = async tokenPrices => {
  return await getStargatePrices(chainId, pools, tokenPrices);
};

module.exports = getStargateMetisPrices;
