const { web3Factory } = require('./web3');

const updateDelay = 3000000;
const blockPeriod = 100;

let cache = {};
const getBlockTime = async chainId => {
  const cacheKey = Math.floor(Date.now() / updateDelay);

  if (cache[chainId]?.hasOwnProperty(cacheKey)) {
    return cache[chainId][cacheKey];
  }

  const web3 = web3Factory(chainId);

  const currentBlock = await web3.eth.getBlock('latest');
  const fromBlock = await web3.eth.getBlock(currentBlock.number - blockPeriod);

  const blockTimePromise = (currentBlock.timestamp - fromBlock.timestamp) / blockPeriod;

  cache[chainId] = {
    [cacheKey]: blockTimePromise,
  };
  return blockTimePromise;
};

module.exports = getBlockTime;
