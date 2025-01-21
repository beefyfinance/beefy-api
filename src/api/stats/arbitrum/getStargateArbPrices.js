const getStargateV2Prices = require('../common/stargate/getStargateV2Prices');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
const poolsV2 = require('../../../data/arbitrum/stargateV2ArbPools.json');

const getStargateArbPrices = async tokenPrices => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

module.exports = getStargateArbPrices;
