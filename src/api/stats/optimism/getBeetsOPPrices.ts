const getBalancerPrices = require('../common/getBalancerPrices');
const { optimismWeb3: web3 } = require('../../../utils/web3');
const { OPTIMISM_CHAIN_ID } = require('../../../constants');
const beetsPools = require('../../../data/optimism/beethovenxLpPools.json');

const pools = [...beetsPools];

const getBeetsOPPrices = async tokenPrices => {
  return await getBalancerPrices(web3, OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getBeetsOPPrices;
