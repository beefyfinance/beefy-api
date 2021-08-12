const { web3Factory } = require('./web3');

const fastestChainBlockTimeInMilliseconds = 3000;
const blockPeriod = 100;

let cache = {};
const getBlockTime = async chainId => {
  const cacheKey = Math.floor(Date.now() / fastestChainBlockTimeInMilliseconds);

  if (cache[chainId]?.hasOwnProperty(cacheKey)) {
    return cache[chainId][cacheKey];
  }

  const web3 = web3Factory(chainId);

  const currentBlockNumber = await web3.eth.getBlockNumber();
  const currentBlock = await web3.eth.getBlock(currentBlockNumber);

  const pastBlockNumber = currentBlockNumber - blockPeriod;
  const pastBlock = await web3.eth.getBlock(pastBlockNumber);

  const blockTimePromise = (currentBlock.timestamp - pastBlock.timestamp) / blockPeriod;

  cache[chainId] = {
    [cacheKey]: blockTimePromise,
  };
  return blockTimePromise;
};

module.exports = getBlockTime;
