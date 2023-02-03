const getStargatePrices = require('../../common/getStargatePrices');
const { bscWeb3: web3 } = require('../../../../utils/web3');
const { BSC_CHAIN_ID: chainId } = require('../../../../constants');
const pools = require('../../../../data/bsc/stargateBscPools.json');

const getStargateBscPrices = async tokenPrices => {
  return await getStargatePrices(web3, chainId, pools, tokenPrices);
};

module.exports = getStargateBscPrices;
