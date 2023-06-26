const { default: BigNumber } = require('bignumber.js');
const { getRPCClient } = require('../api/rpc/client');

const updateDelay = 3000000;
const blockPeriod = 1000n;

let cache = {};
const getBlockTime = async chainId => {
  const cacheKey = Math.floor(Date.now() / updateDelay);

  if (cache[chainId]?.hasOwnProperty(cacheKey)) {
    return cache[chainId][cacheKey];
  }

  const client = getRPCClient(chainId);

  const latestBlock = await client.getBlock({ blockTag: 'latest' });
  const fromBlock = await client.getBlock({ blockNumber: latestBlock.number - blockPeriod });

  const blockTimePromise = new BigNumber(
    Number(latestBlock.timestamp - fromBlock.timestamp) / Number(blockPeriod)
  );

  cache[chainId] = {
    [cacheKey]: blockTimePromise,
  };
  return blockTimePromise;
};

module.exports = getBlockTime;
