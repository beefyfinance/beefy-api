const getStableSwapPrices = require('../common/getStableSwapPrices');
const { cronosWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/cronos/ferroPools.json');

const getFerroPrices = async tokenPrices => {
  return await getStableSwapPrices(web3, pools, tokenPrices);
};

module.exports = getFerroPrices;
