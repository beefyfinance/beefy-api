const getStargateV2Prices = require('../../common/stargate/getStargateV2Prices');
const { BSC_CHAIN_ID: chainId } = require('../../../../constants');
const poolsV2 = require('../../../../data/bsc/stargateV2BscPools.json');

const getStargateBscPrices = async tokenPrices => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

module.exports = getStargateBscPrices;
