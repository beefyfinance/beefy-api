const getStargateV2Prices = require('../common/stargate/getStargateV2Prices');
const { ETH_CHAIN_ID: chainId } = require('../../../constants');
const poolsV2 = require('../../../data/ethereum/stargateV2EthPools.json');

const getStargateEthPrices = async tokenPrices => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

module.exports = getStargateEthPrices;
