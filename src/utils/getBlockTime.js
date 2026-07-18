import { default as BigNumber }from 'bignumber.js';
import { getRPCClient } from '../api/rpc/client.ts';
import { getLoggerFor } from './logger/index.ts';

const logger = getLoggerFor({ module: 'rpc' });

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

    const blockTime = new BigNumber(Number(latestBlock.timestamp - fromBlock.timestamp) / Number(blockPeriod));
    cache[chainId] = {
      lastUpdate: now,
      blockDuration: blockTime,
    };
    return blockTime;
  } catch (err) {
    logger.warn({ chain: chainId }, 'get block time failed');
    // console.error(err);
    return new BigNumber(0);
  }
};

export default getBlockTime;
