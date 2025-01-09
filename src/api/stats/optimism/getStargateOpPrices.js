const getStargateV2Prices = require('../common/stargate/getStargateV2Prices');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
const poolsV2 = require('../../../data/optimism/stargateV2OpPools.json');

const getStargateOpPrices = async tokenPrices => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

module.exports = getStargateOpPrices;
