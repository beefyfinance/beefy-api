const getBalancerPrices = require('../common/getBalancerPrices');
const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID } = require('../../../constants');
const pools = require('../../../data/fantom/beethovenxPools.json');

const getBeethovenxPrices = async tokenPrices => {
  return await getBalancerPrices(web3, FANTOM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getBeethovenxPrices;


