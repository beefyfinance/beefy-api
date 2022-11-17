const getStargatePrices = require('../common/getStargatePrices');
const { optimismWeb3: web3 } = require('../../../utils/web3');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/optimism/stargateOpPools.json');

const getStargateOpPrices = async tokenPrices => {
  return await getStargatePrices(web3, chainId, pools, tokenPrices);
};

module.exports = getStargateOpPrices;
