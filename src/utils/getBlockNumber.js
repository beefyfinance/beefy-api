const { web3Factory } = require('./web3');

const fastestChainBlockTimeInMilliseconds = 3000;

let cache = {};
const getBlockNumber = async chainId => {
  const cacheKey = Math.floor(Date.now() / fastestChainBlockTimeInMilliseconds);

  if (cache[chainId]?.hasOwnProperty(cacheKey)) {
    return cache[chainId][cacheKey];
  }

  const web3 = web3Factory(chainId);
  const blockNumberPromise = web3.eth.getBlockNumber();
  cache[chainId] = {
    [cacheKey]: blockNumberPromise,
  };
  return blockNumberPromise;
};

module.exports = getBlockNumber;
