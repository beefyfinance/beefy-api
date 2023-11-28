const getStargatePrices = require('../common/getStargatePrices');
const { KAVA_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/kava/stargateKavaPools.json');

const getStargateKavaPrices = async tokenPrices => {
  return await getStargatePrices(chainId, pools, tokenPrices);
};

module.exports = getStargateKavaPrices;
