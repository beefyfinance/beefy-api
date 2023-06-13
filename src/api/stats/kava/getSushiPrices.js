const getSushiConstantProductPrices = require('../common/sushi/getSushiConstantProductPrices');
const pools = require('../../../data/kava/sushiKavaLpPools.json');
const { KAVA_CHAIN_ID } = require('../../../constants');

const getSushiKavaPrices = async tokenPrices => {
  return await getSushiConstantProductPrices(KAVA_CHAIN_ID, pools, tokenPrices);
};

module.exports = getSushiKavaPrices;
