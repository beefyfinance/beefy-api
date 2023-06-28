const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { optimismWeb3: web3 } = require('../../../utils/web3');
const newPools = require('../../../data/optimism/velodromeStableLpPools.json');
const oldPools = require('../../../data/optimism/oldVelodromeStableLpPools.json');

const pools = [...oldPools, ...newPools];
const getVelodromeStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getVelodromeStablePrices;
