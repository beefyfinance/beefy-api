import { BigNumber } from 'bignumber.js';
import { orderBy } from 'lodash-es';
import type { Address } from 'viem';
import { default as BeefyPriceMulticall } from '../abis/BeefyPriceMulticall.ts';
import { fetchContract } from '../api/rpc/client.ts';
import { isDefined } from './array.ts';
import { ApiChainId, fromChainNumber, getChainConfig } from './chain.ts';
import { envBoolean, envNumber } from './env.ts';
import { getLoggerFor } from './logger/index.ts';
import { normalizeNativeWrappedPrices } from './normalizeNativeWrappedPrices.ts';
import { isValidPrice } from './prices.ts';
import { batchMapRetry, isContextResultFulfilled, isContextResultRejected } from './promise.ts';
import { withTracing } from './tracing.ts';

const logger = getLoggerFor({ module: 'prices', component: 'amm' });

/** Output a warning if LP (balance0*price0) != (balance1*price1) within a threshold % */
const AMM_PRICES_CHECK_POOLS = envBoolean('AMM_PRICES_CHECK_POOLS', false);
const AMM_PRICES_CHECK_POOLS_THRESHOLD = envNumber('AMM_PRICES_CHECK_POOLS_THRESHOLD', 2); // %

const BATCH_SIZE = 128;
const DEBUG_ORACLES: string[] = [];

function sortByKeys<T extends Record<string, unknown>>(o: T): T {
  return (Object.keys(o) as Array<keyof T>).sort().reduce((r, k) => {
    r[k] = o[k];
    return r;
  }, {} as T);
}

function calcTokenPrice(knownPrice: number, knownToken: PoolTokenBalance, unknownToken: PoolTokenBalance) {
  const valuation = knownToken.balance.dividedBy(knownToken.decimals).multipliedBy(knownPrice);
  const price = valuation.multipliedBy(unknownToken.decimals).dividedBy(unknownToken.balance);

  //  console.log(knownToken)
  //  console.log(knownPrice)
  //  console.log(unknownToken)
  //  console.log(price.toNumber())

  return {
    price: price.toNumber(),
    weight: unknownToken.balance.dividedBy(unknownToken.decimals).toNumber(),
  };
}

type LpBreakdown = {
  price: number;
  tokens: string[];
  balances: string[];
  totalSupply: string;
};

function calcLpPrice(pool: PoolData, tokenPrices: Record<string, number>): LpBreakdown | undefined {
  const fields = { chain: pool.chainId, pool: pool.name };

  const lp0Price = tokenPrices[pool.lp0.oracleId];
  if (!isValidPrice(lp0Price)) {
    logger.warn({ ...fields, token: pool.lp0.oracleId, price: lp0Price }, 'missing token 0 price');
    return undefined;
  }

  const lp1Price = tokenPrices[pool.lp1.oracleId];
  if (!isValidPrice(lp1Price)) {
    logger.warn({ ...fields, token: pool.lp1.oracleId, price: lp1Price }, 'missing token 1 price');
    return undefined;
  }

  const lp0 = pool.lp0.balance.multipliedBy(lp0Price).dividedBy(pool.lp0.decimals);
  const lp1 = pool.lp1.balance.multipliedBy(lp1Price).dividedBy(pool.lp1.decimals);
  const price = lp0.plus(lp1).multipliedBy(pool.decimals).dividedBy(pool.totalSupply).toNumber();
  if (!isValidPrice(price)) {
    logger.warn({ ...fields, price, totalSupply: pool.totalSupply.toString(10) }, 'invalid price calculated');
    return undefined;
  }

  return {
    price,
    tokens: [pool.lp0.address, pool.lp1.address],
    balances: [
      pool.lp0.balance.dividedBy(pool.lp0.decimals).toString(10),
      pool.lp1.balance.dividedBy(pool.lp1.decimals).toString(10),
    ],
    totalSupply: pool.totalSupply.dividedBy(pool.decimals).toString(10),
  };
}

type KnownUnknownPair = {
  knownToken: PoolTokenBalance;
  unknownToken: PoolTokenBalance;
};

export type FetchAmmPricesResult = {
  poolPrices: Record<string, number>;
  tokenPrices: Record<string, number>;
  lpsBreakdown: Record<
    string,
    {
      price: number;
      tokens: string[];
      balances: string[];
      totalSupply: string;
    }
  >;
};

export const fetchAmmPrices = withTracing(
  async (pools: Pool[], knownPrices: Record<string, number>): Promise<FetchAmmPricesResult> => {
    const prices: Record<string, number> = { ...knownPrices };
    const lps: Record<string, number> = {};
    const breakdown: FetchAmmPricesResult['lpsBreakdown'] = {};
    const weights: Record<string, number> = {};

    Object.keys(knownPrices).forEach(known => {
      weights[known] = Number.MAX_SAFE_INTEGER;
    });

    const chainsWithPools = Array.from(new Set(pools.map(p => p.chainId || ApiChainId.bsc)));
    let leftChains = chainsWithPools;
    const poolsWithData = (
      await Promise.all(
        chainsWithPools.map(async chain => {
          // Old BSC pools don't have the chainId attr
          const chainPools =
            chain === ApiChainId.bsc
              ? pools.filter(p => p.chainId === chain || p.chainId === undefined)
              : pools.filter(p => p.chainId === chain);

          try {
            return await fetchChainPools(chain, chainPools);
          } finally {
            leftChains = leftChains.filter(c => c !== chain);
            if (leftChains.length > 0)
              logger.debug({ chain, count: leftChains.length }, 'fetched amm prices for chain');
            else logger.info('amm prices fetched');
          }
        })
      )
    ).flat();

    const unpriced = poolsWithData.slice();
    let solving = true;
    while (solving) {
      solving = false;

      for (let i = unpriced.length - 1; i >= 0; i--) {
        const pool = unpriced[i];
        const trySolve: KnownUnknownPair[] = [];
        let poolPriced = false;

        if (isValidPrice(prices[pool.lp0.oracleId]) && isValidPrice(prices[pool.lp1.oracleId])) {
          trySolve.push({ knownToken: pool.lp0, unknownToken: pool.lp1 });
          trySolve.push({ knownToken: pool.lp1, unknownToken: pool.lp0 });
          poolPriced = true;
        } else if (isValidPrice(prices[pool.lp0.oracleId])) {
          trySolve.push({ knownToken: pool.lp0, unknownToken: pool.lp1 });
        } else if (isValidPrice(prices[pool.lp1.oracleId])) {
          trySolve.push({ knownToken: pool.lp1, unknownToken: pool.lp0 });
        } else {
          // both unknown: not solved yet but could be solved later
          continue;
        }

        for (const { knownToken, unknownToken } of trySolve) {
          const { price, weight } = calcTokenPrice(prices[knownToken.oracleId], knownToken, unknownToken);
          if (!isValidPrice(price)) {
            continue;
          }

          const existingWeight = weights[unknownToken.oracleId] || 0;
          const betterPrice = weight > existingWeight;

          if (DEBUG_ORACLES.includes(unknownToken.oracleId)) {
            logger.warn(
              {
                action: betterPrice ? 'setting' : 'skipping',
                oracleId: unknownToken.oracleId,
                price,
                via: knownToken.oracleId,
                viaPrice: prices[knownToken.oracleId],
                pool: pool.name,
                address: pool.address,
                weight,
                existingWeight,
              },
              'solving token price'
            );
          }

          if (betterPrice) {
            prices[unknownToken.oracleId] = price;
            weights[unknownToken.oracleId] = weight;
            poolPriced = true;
          }
        }

        if (poolPriced) {
          unpriced.splice(i, 1);
          // keep going only if at least once pool was solved this loop
          solving = true;
        }
      }
    }

    for (const pool of poolsWithData) {
      const lpData = calcLpPrice(pool, prices);
      if (lpData) {
        lps[pool.name] = lpData.price;
        breakdown[pool.name] = lpData;
      }
    }

    if (AMM_PRICES_CHECK_POOLS) {
      checkPoolsPrices(poolsWithData, prices);
    }

    return {
      poolPrices: sortByKeys(lps),
      tokenPrices: sortByKeys(normalizeNativeWrappedPrices(prices)),
      lpsBreakdown: sortByKeys(breakdown),
    };
  },
  { logger }
);

function checkPoolsPrices(pools: PoolData[], prices: Record<string, number>) {
  const results = pools
    .map(pool => {
      const lp0Price = prices[pool.lp0.oracleId];
      const lp1Price = prices[pool.lp1.oracleId];
      if (!isValidPrice(lp0Price) || !isValidPrice(lp1Price)) {
        // already logged via calcLpPrice
        return undefined;
      }

      const lp0Value = pool.lp0.balance.multipliedBy(lp0Price).dividedBy(pool.lp0.decimals);
      const lp1Value = pool.lp1.balance.multipliedBy(lp1Price).dividedBy(pool.lp1.decimals);
      const percentDiff = lp0Value
        .minus(lp1Value)
        .abs()
        .dividedBy(lp0Value.plus(lp1Value).dividedBy(2))
        .multipliedBy(100)
        .toNumber();
      return { pool, lp0Price, lp1Price, lp0Value, lp1Value, percentDiff };
    })
    .filter(isDefined);

  const likelyHaveError = orderBy(
    results.filter(r => r.percentDiff >= AMM_PRICES_CHECK_POOLS_THRESHOLD),
    r => r.percentDiff,
    'desc'
  );
  if (likelyHaveError.length > 0) {
    logger.warn(
      { count: likelyHaveError.length },
      'amm pools likely have bad prices or low liquidity which could have knock-on effects'
    );
    logger.debug({ threshold: AMM_PRICES_CHECK_POOLS_THRESHOLD }, 'amm price check threshold');
    logger.debug(
      {
        pools: likelyHaveError.map(r => ({
          name: r.pool.name,
          diff: `${r.percentDiff.toFixed(2)}%`,
          oracle0: r.pool.lp0.oracleId,
          price0: `$${r.lp0Price}`,
          value0: `$${r.lp0Value.toNumber()}`,
          oracle1: r.pool.lp1.oracleId,
          price1: `$${r.lp1Price}`,
          value1: `$${r.lp1Value.toNumber()}`,
        })),
      },
      'amm pools with likely bad prices'
    );
  }
}

type PoolToken = {
  address: string;
  oracle: string;
  oracleId: string;
  decimals: string;
};

type Pool = {
  name: string;
  address: string;
  decimals: string;
  chainId?: ApiChainId;
  lp0: PoolToken;
  lp1: PoolToken;
};

type PoolTokenBalance = PoolToken & {
  balance: BigNumber;
};

type PoolData = Omit<Pool, 'lp0' | 'lp1'> & {
  totalSupply: BigNumber;
  lp0: PoolTokenBalance;
  lp1: PoolTokenBalance;
};

const fetchChainPools = withTracing(
  async (chain: ApiChainId, pools: Pool[]): Promise<PoolData[]> => {
    if (pools.length === 0) {
      return [];
    }
    const apiChain = fromChainNumber(chain);
    const multicallAddress = apiChain ? getChainConfig(apiChain).contracts.beefyPriceMulticall : undefined;
    if (!multicallAddress) {
      throw new Error(`No price multicall address for chain ${chain}`);
    }

    const multicallContract = fetchContract(multicallAddress, BeefyPriceMulticall, chain);
    const results = await batchMapRetry<Pool, PoolData>({
      items: pools,
      batchSize: BATCH_SIZE,
      retryLabel: `fetchAmmChainPools ${chain}`,
      handleFn: async batch => {
        const results = await multicallContract.read.getLpInfo([
          batch.map(p => [p.address as Address, p.lp0.address as Address, p.lp1.address as Address]),
        ]);
        return batch.map((pool, i) => ({
          ...pool,
          totalSupply: new BigNumber(results[i * 3].toString(10)),
          lp0: {
            ...pool.lp0,
            balance: new BigNumber(results[i * 3 + 1].toString(10)),
          },
          lp1: {
            ...pool.lp1,
            balance: new BigNumber(results[i * 3 + 2].toString(10)),
          },
        }));
      },
    });

    const failed = results.filter(isContextResultRejected);
    // throw new Error(`TEST Failed to fetch data for ${failed.length} pools on chain ${chain}`);
    if (failed.length > 0) {
      // TODO old js code would set totalSupply/balance to `new BigNumber(undefined)` if a batch failed,
      // which is equivalent to NaN, so we just throw here instead.
      logger.error({ chain, count: failed.length, failed }, 'failed to fetch amm pool data');
      throw new Error(`Failed to fetch data for ${failed.length} pools on chain ${chain}`);
    }

    return results.filter(isContextResultFulfilled).map(r => r.value);
  },
  { logger, fieldsFn: (chain: ApiChainId) => ({ chain }) }
);
