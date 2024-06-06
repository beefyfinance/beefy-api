const getStargatePrices = require('../common/getStargatePrices');
const getStargateV2Prices = require('../common/stargate/getStargateV2Prices');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
const poolsV1 = require('../../../data/optimism/stargateOpPools.json');
const poolsV2 = require('../../../data/optimism/stargateV2OpPools.json');

const getStargateOpPrices = async tokenPrices => {
  const pricesV1 = await getStargatePrices(chainId, poolsV1, tokenPrices);
  const pricesV2 = await getStargateV2Prices(chainId, poolsV2, tokenPrices);
  return { ...pricesV1, ...pricesV2 };
};

module.exports = getStargateOpPrices;
