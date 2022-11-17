const getStargatePrices = require('../common/getStargatePrices');
const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/arbitrum/stargateArbPools.json');

const getStargateArbPrices = async tokenPrices => {
  return await getStargatePrices(web3, chainId, pools, tokenPrices);
};

module.exports = getStargateArbPrices;
