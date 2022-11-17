const getStargatePrices = require('../common/getStargatePrices');
const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/fantom/stargateFantomPools.json');

const getStargateFantomPrices = async tokenPrices => {
  return await getStargatePrices(web3, chainId, pools, tokenPrices);
};

module.exports = getStargateFantomPrices;
