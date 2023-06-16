const getGammaPrices = require('../common/getGammaPrices');
const { bscWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/degens/thenaGammaPools.json');

const getThenaGammaPrices = async tokenPrices => {
  return await getGammaPrices(web3, pools, tokenPrices);
};

module.exports = getThenaGammaPrices;
