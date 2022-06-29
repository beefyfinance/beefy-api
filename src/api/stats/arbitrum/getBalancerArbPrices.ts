const getBalancerPrices = require('../common/getBalancerPrices');
const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
const balancerPools = require('../../../data/arbitrum/balancerArbLpPools.json');

const pools = [...balancerPools];

const getBalancerArbPrices = async tokenPrices => {
  return await getBalancerPrices(web3, chainId, pools, tokenPrices);
};

module.exports = getBalancerArbPrices;
