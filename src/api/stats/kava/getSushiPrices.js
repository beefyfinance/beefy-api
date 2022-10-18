const getSushiConstantProductPrices = require('../common/sushi/getSushiConstantProductPrices');
const { kavaWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/kava/sushiKavaLpPools.json');

const getSushiKavaPrices = async tokenPrices => {
  return await getSushiConstantProductPrices(web3, pools, tokenPrices);
};

module.exports = getSushiKavaPrices;