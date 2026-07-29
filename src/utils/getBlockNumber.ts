import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { default as BigNumber } from 'bignumber.js';
import { getRPCClient } from '../api/rpc/client.ts';

const fastestChainBlockTimeInMilliseconds = 3000;

let cache: Record<number, Record<number, BigNumber>> = {};
const getBlockNumber = async (chainId: ChainId) => {
  const cacheKey = Math.floor(Date.now() / fastestChainBlockTimeInMilliseconds);

  if (cache[chainId]?.hasOwnProperty(cacheKey)) {
    return cache[chainId][cacheKey];
  }

  const client = getRPCClient(chainId);
  const blockNumberPromise = await client.getBlockNumber().then(res => new BigNumber(res.toString()));
  cache[chainId] = {
    [cacheKey]: blockNumberPromise,
  };
  return blockNumberPromise;
};

export default getBlockNumber;
