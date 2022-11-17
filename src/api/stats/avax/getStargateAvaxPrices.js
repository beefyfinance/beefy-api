const getStargatePrices = require('../common/getStargatePrices');
const { avaxWeb3: web3 } = require('../../../utils/web3');
const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/avax/stargateAvaxPools.json');

const getStargateAvaxPrices = async tokenPrices => {
  return await getStargatePrices(web3, chainId, pools, tokenPrices);
};

module.exports = getStargateAvaxPrices;
