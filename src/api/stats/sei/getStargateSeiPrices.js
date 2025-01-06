const getStargateV2Prices = require('../common/stargate/getStargateV2Prices');
const { SEI_CHAIN_ID: chainId } = require('../../../constants');
const poolsV2 = require('../../../data/sei/stargateV2SeiPools.json');

const getStargateSeiPrices = async tokenPrices => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

module.exports = getStargateSeiPrices;
