const getStargatePrices = require('../common/getStargatePrices');
const { metisWeb3: web3 } = require('../../../utils/web3');
const { METIS_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/metis/stargateMetisPools.json');

const getStargateMetisPrices = async tokenPrices => {
  return await getStargatePrices(web3, chainId, pools, tokenPrices);
};

module.exports = getStargateMetisPrices;
