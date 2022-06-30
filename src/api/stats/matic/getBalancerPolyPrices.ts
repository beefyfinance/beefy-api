const getBalancerPrices = require('../common/getBalancerPrices');
const { polygonWeb3: web3 } = require('../../../utils/web3');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const balancerPools = require('../../../data/matic/balancerPolyLpPools.json');

const pools = [...balancerPools];

const getBalancerPolyPrices = async tokenPrices => {
  return await getBalancerPrices(web3, chainId, pools, tokenPrices);
};

module.exports = getBalancerPolyPrices;
