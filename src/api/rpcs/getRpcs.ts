import { getKey, setKey } from '../../utils/redisHelper.js';
import rpcsByChain from '../../data/rpcs.json';
import fetch from 'node-fetch';
import { mapValues } from '../../utils/typeUtils';
import BigNumber from 'bignumber.js';
import { createTimeoutSignal } from '../../utils/fetchUtils';
import { sortBy } from 'lodash';
import { MULTICHAIN_RPC } from '../../constants';

const INIT_DELAY = 0;
const REFRESH_INTERVAL = 60 * 1000;
const SCORE_UNKNOWN = 1000;
const REDIS_KEY = 'RPCS';

type RpcsByChain = typeof rpcsByChain;
type Chains = keyof RpcsByChain;

type ScoredRpc = {
  rpc: string;
  score: number;
  blocksBehind?: number;
  latency?: number;
  eip1559?: true | false;
  updatedAt?: number;
};

type ScoredRpcsByChain = {
  [k in Chains]: ScoredRpc[];
};

let scoredRpcsByChain: ScoredRpcsByChain = mapValues(rpcsByChain, rpcs =>
  rpcs.map(rpc => ({
    rpc,
    score: SCORE_UNKNOWN,
  }))
);

export async function initRpcsService() {
  const saved = await loadFromRedis();
  if (saved && typeof saved === 'object') {
    scoredRpcsByChain = { ...scoredRpcsByChain, ...saved };
  }
  setTimeout(queryRpcs, INIT_DELAY);
}

async function queryRpcs() {
  const results = await Promise.allSettled(
    Object.entries(rpcsByChain).map(([id, rpcs]) => queryChain(id, rpcs))
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      scoredRpcsByChain[result.value.id] = result.value.rpcs;
    }
  }

  saveToRedis(scoredRpcsByChain);
  setTimeout(queryRpcs, REFRESH_INTERVAL);
}

type QueryChainResult = {
  id: string;
  rpcs: ScoredRpc[];
};

async function queryChain(id: string, rpcs: string[]): Promise<QueryChainResult> {
  const results = await Promise.all(rpcs.map(rpc => queryRpc(rpc)));
  const successes = results.filter(isQueryRpcSuccess);

  // if none succeeded, return all
  if (successes.length === 0) {
    return {
      id,
      rpcs: rpcs.map(rpc => ({ rpc, score: SCORE_UNKNOWN })),
    };
  }

  // assume if one RPC supports EIP-1559, all of them should
  // so throw away those that don't
  const isEip1559 = successes.find(result => result.eip1559) !== undefined;
  const matchingEip1559 = successes.filter(result => result.eip1559 === isEip1559);

  // throw away blocks under the median
  const blocks = matchingEip1559.map(result => result.block).sort((a, b) => b.comparedTo(a));
  const medianBlock = blocks[Math.floor(blocks.length / 2)];
  const newestBlock = blocks[0];
  const matchingBlock = matchingEip1559.filter(result => result.block.gte(medianBlock));
  const maxBlocksBehind = newestBlock.minus(medianBlock).toNumber();

  // Latencies
  const latencies = matchingBlock.map(result => result.latency);
  const highestLatency = Math.max(...latencies);
  const lowestLatency = Math.min(...latencies);
  const latencyRange = highestLatency - lowestLatency;

  const scored = sortBy(
    matchingBlock.map(result => {
      // score latency relative to others
      const latencyBehind = result.latency - lowestLatency;
      const latencyScore = latencyRange === 0 ? 0 : latencyBehind / latencyRange; // 0 = lowest latency, 1 = highest

      // score blocks: don't penalize when only 1 block behind
      const blocksBehind = newestBlock.minus(result.block).toNumber();
      const blockScore =
        maxBlocksBehind === 0 || blocksBehind <= 1 ? 0 : blocksBehind / maxBlocksBehind; // 0 = most recent, 1 = most behind

      return {
        ...result,
        blocksBehind,
        score: (latencyScore + blockScore) / 2,
      };
    }),
    ['score']
  );

  return {
    id,
    rpcs: scored,
  };
}

type QueryRpcError = { rpc: string; error: true };
type QueryRpcSuccess = {
  rpc: string;
  latency: number;
  block: BigNumber;
  eip1559: boolean;
  updatedAt: number;
};
type QueryRpcResult = QueryRpcError | QueryRpcSuccess;

function isQueryRpcSuccess(result: QueryRpcResult): result is QueryRpcSuccess {
  return !('error' in result);
}

async function queryRpc(rpc: string): Promise<QueryRpcResult> {
  try {
    const now = Date.now();
    const start = process.hrtime();
    const response = await fetch(rpc, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
      }),
      signal: createTimeoutSignal(2000),
    });

    const data = await response.json();
    const time = process.hrtime(start);

    if (!data || data.id !== 1 || !data.result || !data.result.number) {
      return { rpc, error: true };
    }

    const latency = time[0] * 1e3 + time[1] / 1e6;
    const block = new BigNumber(data.result.number);
    const eip1559 = 'baseFeePerGas' in data.result;

    return { rpc, latency, block, eip1559, updatedAt: now };
  } catch {
    return { rpc, error: true };
  }
}

async function loadFromRedis() {
  return await getKey(REDIS_KEY);
}

async function saveToRedis(value) {
  await setKey(REDIS_KEY, value);
}

async function getRpcs() {
  return scoredRpcsByChain;
}

/**
 * Available for use in rest of API if needed
 * Returns default RPC e.g. BSC_RPC if scores have not loaded yet
 * Note: will not return premium RPCs that may be set in env variables
 */
export async function getBestRpcFor(chain: Chains): Promise<string> {
  if (chain in scoredRpcsByChain) {
    const scoredRpcs = scoredRpcsByChain[chain];
    if (scoredRpcs.length && scoredRpcs[0].score < SCORE_UNKNOWN) {
      return scoredRpcs[0].rpc;
    }
  }

  return MULTICHAIN_RPC[chain];
}

/**
 * API request
 */
export async function rpcs(ctx) {
  ctx.status = 200;
  ctx.body = await getRpcs();
  // Cache for 1 min, allow use of cached response for 10 mins if error returned on revalidate request
  ctx.set('Cache-Control', 'public, max-age=60, stale-if-error=600');
}
