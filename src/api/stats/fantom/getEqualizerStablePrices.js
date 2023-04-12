const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { fantomWeb3: web3 } = require('../../../utils/web3');
const v1Pools = require('../../../data/fantom/equalizerStableLpPools.json');
const v2Pools = require('../../../data/fantom/equalizerV2StableLpPools.json');

const pools = [...v1Pools, ...v2Pools];

const getEqualizerStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getEqualizerStablePrices;
