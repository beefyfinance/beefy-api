const getGammaPrices = require('../common/getGammaPrices');
const { zkevmWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/zkevm/quickGammaLpPools.json');

const getQuickGammaZkPrices = async tokenPrices => {
  return await getGammaPrices(web3, pools, tokenPrices);
};

module.exports = getQuickGammaZkPrices;
