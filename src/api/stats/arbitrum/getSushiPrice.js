const getSushiConstantProductPrices = require('../common/sushi/getSushiConstantProductPrices');
const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/arbitrum/sushiConstantProductLpPools.json');

const getSushiArbPrices = async tokenPrices => {
  return await getSushiConstantProductPrices(web3, pools, tokenPrices);
};

module.exports = getSushiArbPrices;
