const getBalancerPrices = require('../common/getBalancerPrices');
const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID } = require('../../../constants');
const beetsPools = require('../../../data/fantom/beethovenxPools.json');
const fBeetsPool = require('../../../data/fantom/fBeetsPool.json');
const maiPools = require('../../../data/fantom/maiLpPools.json');

const pools = [...beetsPools, ...fBeetsPool, ...maiPools];

const getBeethovenxPrices = async tokenPrices => {
  return await getBalancerPrices(web3, FANTOM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getBeethovenxPrices;
