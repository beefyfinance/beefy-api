const getGammaPrices = require('../common/getGammaPrices');
const { polygonWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/matic/quickGammaLpPools.json');

const getQuickGammaPrices = async tokenPrices => {
  return await getGammaPrices(web3, pools, tokenPrices);
};

module.exports = getQuickGammaPrices;
