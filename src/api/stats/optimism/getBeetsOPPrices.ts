const getBalancerPrices = require('../common/getBalancerPrices');
const { optimismWeb3: web3 } = require('../../../utils/web3');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
const beetsPools = require('../../../data/optimism/beethovenxLpPools.json');

const pools = [...beetsPools];

const getBeetsOPPrices = async tokenPrices => {
  return await getBalancerPrices(web3, chainId, pools, tokenPrices);
};

module.exports = getBeetsOPPrices;
