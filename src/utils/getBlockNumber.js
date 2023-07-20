const { default: BigNumber } = require('bignumber.js');
const { getRPCClient } = require('../api/rpc/client');

const fastestChainBlockTimeInMilliseconds = 3000;

let cache = {};
const getBlockNumber = async chainId => {
  const cacheKey = Math.floor(Date.now() / fastestChainBlockTimeInMilliseconds);

  if (cache[chainId]?.hasOwnProperty(cacheKey)) {
    return cache[chainId][cacheKey];
  }

  const client = getRPCClient(chainId);
  const blockNumberPromise = await client
    .getBlockNumber()
    .then(res => new BigNumber(res.toString()));
  cache[chainId] = {
    [cacheKey]: blockNumberPromise,
  };
  return blockNumberPromise;
};

module.exports = getBlockNumber;
