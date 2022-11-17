const getStargatePrices = require('../common/getStargatePrices');
const { ethereumWeb3: web3 } = require('../../../utils/web3');
const { ETH_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/ethereum/stargateEthPools.json');

const getStargateEthPrices = async tokenPrices => {
  return await getStargatePrices(web3, chainId, pools, tokenPrices);
};

module.exports = getStargateEthPrices;
