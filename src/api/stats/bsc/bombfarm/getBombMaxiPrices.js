const getBalancerPrices = require('../../common/getBalancerPrices');
const { bscWeb3: web3 } = require('../../../../utils/web3');
const { BSC_CHAIN_ID } = require('../../../../constants');
const bombPools = require('../../../../data/bombAcsiPools.json');
//const fBeetsPool = require('../../../data/fantom/fBeetsPool.json');

const pools = [...bombPools];

const getBombMaxiPrices = async tokenPrices => {
  return await getBalancerPrices(web3, BSC_CHAIN_ID, pools, tokenPrices);
};

module.exports = getBombMaxiPrices;
