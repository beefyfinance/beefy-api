const getSushiConstantProductPrices = require('../common/sushi/getSushiConstantProductPrices');
const pools = require('../../../data/arbitrum/sushiConstantProductLpPools.json');
const { ARBITRUM_CHAIN_ID } = require('../../../constants');

const getSushiArbPrices = async tokenPrices => {
  return await getSushiConstantProductPrices(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getSushiArbPrices;
