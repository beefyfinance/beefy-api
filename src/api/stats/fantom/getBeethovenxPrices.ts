const getBalancerPrices = require('../common/getBalancerPrices');
const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID } = require('../../../constants');
const beetsPools = require('../../../data/fantom/beethovenxPools.json');
const beetsDualPools = require('../../../data/fantom/beethovenxDualPools.json');
const fBeetsPool = require('../../../data/fantom/fBeetsPool.json');

const pools = [...beetsPools, ...fBeetsPool, ...beetsDualPools];

const getBeethovenxPrices = async tokenPrices => {
  return await getBalancerPrices(web3, FANTOM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getBeethovenxPrices;
