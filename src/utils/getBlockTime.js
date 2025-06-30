const { default: BigNumber } = require('bignumber.js');
const { getRPCClient } = require('../api/rpc/client');

const updateDelay = 3000000;
const blockPeriod = 1000n;

let cache = {};
const getBlockTime = async chainId => {
  try {
    const now = Date.now();
    if (cache[chainId] && cache[chainId].lastUpdate > now - updateDelay) {
      return cache[chainId].blockDuration;
    }

    const client = getRPCClient(chainId);

    const latestBlock = await client.getBlock({ blockTag: 'latest' });
    const fromBlock = await client.getBlock({ blockNumber: latestBlock.number - blockPeriod });

    const blockTime = new BigNumber(
      Number(latestBlock.timestamp - fromBlock.timestamp) / Number(blockPeriod)
    );
    cache[chainId] = {
      lastUpdate: now,
      blockDuration: blockTime,
    };
    return blockTime;
  } catch (err) {
    console.error(`getBlockTime error on ${chainId}:`);
    // console.error(err);
    return new BigNumber(0);
  }
};

module.exports = getBlockTime;
