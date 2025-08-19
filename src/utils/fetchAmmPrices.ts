import { ChainId } from '../../packages/address-book/src/types/chainid';
import { Address } from 'viem';
import BigNumber from 'bignumber.js';
import { fetchContract } from '../api/rpc/client';
import { default as BeefyPriceMulticall } from '../abis/BeefyPriceMulticall';
import { batchMapRetry, isContextResultFulfilled, isContextResultRejected } from './promise';
import { promiseTiming } from './timing';
import { orderBy } from 'lodash';
import { envBoolean, envNumber } from './env';
import { normalizeNativeWrappedPrices } from './normalizeNativeWrappedPrices';

/** Output a warning if LP (balance0*price0) != (balance1*price1) within a threshold % */
const AMM_PRICES_CHECK_POOLS = envBoolean('AMM_PRICES_CHECK_POOLS', false);
const AMM_PRICES_CHECK_POOLS_THRESHOLD = envNumber('AMM_PRICES_CHECK_POOLS_THRESHOLD', 2); // %

const MULTICALLS = new Map<ChainId, Address>([
  [56, '0xbcf79F67c2d93AD5fd1b919ac4F5613c493ca34F'],
  [128, '0x6066F766f47aC8dbf6F21aDF2493316A8ACB7e34'],
  [137, '0x2D955C68f8c687242d7475cD0Cc86E6a4A6D968e'],
  [250, '0x1E715c49A810ff428a128b1bBdee221eF9548F67'],
  [43114, '0x294d57F60f71036d9C96b008E32744D0909FABbA'],
  [1666600000, '0xa9E6E271b27b20F65394914f8784B3B860dBd259'],
  [42161, '0x405EE7F4f067604b787346bC22ACb66b06b15A4B'],
  [42220, '0xE99c8A590c98c7Ae9FB3B7ecbC115D2eBD533B50'],
  [1285, '0x8a198BCbF313A5565c64A7Ed61FaA413eB4E0931'],
  [25, '0x405EE7F4f067604b787346bC22ACb66b06b15A4B'],
  [1313161554, '0xFE40f6eAD11099D91D51a945c145CFaD1DD15Bb8'],
  [122, '0xE99c8A590c98c7Ae9FB3B7ecbC115D2eBD533B50'],
  [1088, '0xfcDD5a02C611ba6Fe2802f885281500EC95805d7'],
  [1284, '0xd1d13EaAb9A92c47E8D11628AE6cb6C824E85E4B'],
  [42262, '0xE99c8A590c98c7Ae9FB3B7ecbC115D2eBD533B50'],
  [10, '0x13C6bCC2411861A31dcDC2f990ddbe2325482222'],
  [2222, '0xA338D34c5de06B88197609956a2dEAAfF7Af46c8'],
  [1, '0x9D55cAEE108aBdd4C47E42088C97ecA43510E969'],
  [7700, '0xe6CcE165Aa3e52B2cC55F17b1dBC6A8fe5D66610'],
  [324, '0x8BBbA444553e149968A52f46d1294C280C1458B6'],
  [1101, '0x448a3539a591dE3Fb9D5AAE407471D21d40cD315'],
  [8453, '0x3AA76f4aD5cc43E530a6C51c8eb13c40a3753aae'],
  [100, '0x07f1ad98b725Af45485646aC431b7757f50C598A'],
  [59144, '0xe103ab2f922aa1a56EC058AbfDA2CeEa1e95bCd7'],
  [5000, '0xee59DE6E749cc6cF6ebD30878D8B4222C4aea37C'],
  [252, '0xBC4a342B0c057501E081484A2d24e576E854F823'],
  [34443, '0x448a3539a591dE3Fb9D5AAE407471D21d40cD315'],
  [169, '0xD4F05538e8e79f3413B4A4E693eC0299E03e3151'],
  [1329, '0xD535BDbc82cc04Ccc360E9f948cD8F9f76084088'],
  [534352, '0xD985027E547a34d4F7E569B365F24aB87c5a9F73'],
  [111188, '0x3D6B199Ccc223283fd2f5000c3f3585d558aCf39'],
  [1135, '0x679d78307720CCdDFf572cc56E3C35F9861033Bc'],
  [146, '0xf2068e1FE1A80E7f5Ba80D6ABD6e8618aD4E959E'],
  [999, '0x99D7d8b7d4873F277CEDc7e1F4eDE57f4747e003'],
]);

const BATCH_SIZE = 128;
const DEBUG_ORACLES = [];

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

function calcLpPrice(pool: PoolData, tokenPrices: Record<string, number>): LpBreakdown {
  const lp0 = pool.lp0.balance.multipliedBy(tokenPrices[pool.lp0.oracleId]).dividedBy(pool.lp0.decimals);
  const lp1 = pool.lp1.balance.multipliedBy(tokenPrices[pool.lp1.oracleId]).dividedBy(pool.lp1.decimals);
  const price = lp0.plus(lp1).multipliedBy(pool.decimals).dividedBy(pool.totalSupply).toNumber();

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

export async function fetchAmmPrices(
  pools: Pool[],
  knownPrices: Record<string, number>
): Promise<FetchAmmPricesResult> {
  const prices: Record<string, number> = { ...knownPrices };
  const lps: Record<string, number> = {};
  const breakdown: FetchAmmPricesResult['lpsBreakdown'] = {};
  const weights: Record<string, number> = {};

  Object.keys(knownPrices).forEach(known => {
    weights[known] = Number.MAX_SAFE_INTEGER;
  });

  const poolsWithData = (
    await Promise.all(
      Array.from(MULTICALLS.keys(), async chain => {
        // Old BSC pools don't have the chainId attr
        const chainPools =
          chain === ChainId.bsc
            ? pools.filter(p => p.chainId === chain || p.chainId === undefined)
            : pools.filter(p => p.chainId === chain);

        return await promiseTiming(fetchChainPools(chain, chainPools), `fetchChainPools for chain ${chain}`);
      })
    )
  ).flat();

  const unsolved = poolsWithData.slice();
  let solving = true;
  while (solving) {
    solving = false;

    for (let i = unsolved.length - 1; i >= 0; i--) {
      const pool = unsolved[i];
      const trySolve: KnownUnknownPair[] = [];

      if (pool.lp0.oracleId in weights && pool.lp1.oracleId in weights) {
        trySolve.push({ knownToken: pool.lp0, unknownToken: pool.lp1 });
        trySolve.push({ knownToken: pool.lp1, unknownToken: pool.lp0 });
      } else if (pool.lp0.oracleId in prices) {
        trySolve.push({ knownToken: pool.lp0, unknownToken: pool.lp1 });
      } else if (pool.lp1.oracleId in prices) {
        trySolve.push({ knownToken: pool.lp1, unknownToken: pool.lp0 });
      } else {
        // both unknown: not solved yet but could be solved later
        continue;
      }

      for (const { knownToken, unknownToken } of trySolve) {
        const { price, weight } = calcTokenPrice(prices[knownToken.oracleId], knownToken, unknownToken);

        const existingWeight = weights[unknownToken.oracleId] || 0;
        const betterPrice = weight > existingWeight;

        if (DEBUG_ORACLES.includes(unknownToken.oracleId)) {
          console.log(
            `${betterPrice ? 'Setting' : 'Skipping'} ${unknownToken.oracleId} to $${price} via ${
              knownToken.oracleId
            } ($${prices[knownToken.oracleId]}) in ${pool.name} (${
              pool.address
            }) - new weight ${weight} vs existing ${existingWeight}`
          );
        }

        if (betterPrice) {
          prices[unknownToken.oracleId] = price;
          weights[unknownToken.oracleId] = weight;
        }
      }

      unsolved.splice(i, 1);
      solving = true;
    }
  }

  if (unsolved.length > 0) {
    // actually not solved
    console.warn('Unsolved pools: ');
    unsolved.forEach(pool => console.log(pool.chainId, pool.name, pool.lp0.oracleId, pool.lp1.oracleId));
    console.warn('Unsolved tokens:');
    unsolved
      .flatMap(pool => [pool.lp0.oracleId, pool.lp1.oracleId])
      .filter(oracleId => typeof prices[oracleId] !== 'number');
  }

  for (const pool of poolsWithData) {
    const lpData = calcLpPrice(pool, prices);
    lps[pool.name] = lpData.price;
    breakdown[pool.name] = lpData;
  }

  if (AMM_PRICES_CHECK_POOLS) {
    checkPoolsPrices(poolsWithData, prices);
  }

  return {
    poolPrices: sortByKeys(lps),
    tokenPrices: sortByKeys(normalizeNativeWrappedPrices(prices)),
    lpsBreakdown: sortByKeys(breakdown),
  };
}

function checkPoolsPrices(pools: PoolData[], prices: Record<string, number>) {
  const results = pools.map(pool => {
    const lp0Price = prices[pool.lp0.oracleId];
    const lp1Price = prices[pool.lp1.oracleId];
    const lp0Value = pool.lp0.balance.multipliedBy(lp0Price).dividedBy(pool.lp0.decimals);
    const lp1Value = pool.lp1.balance.multipliedBy(lp1Price).dividedBy(pool.lp1.decimals);
    const percentDiff = lp0Value
      .minus(lp1Value)
      .abs()
      .dividedBy(lp0Value.plus(lp1Value).dividedBy(2))
      .multipliedBy(100)
      .toNumber();
    return { pool, lp0Price, lp1Price, lp0Value, lp1Value, percentDiff };
  });
  const likelyHaveError = orderBy(
    results.filter(r => r.percentDiff >= AMM_PRICES_CHECK_POOLS_THRESHOLD),
    r => r.percentDiff,
    'desc'
  );
  if (likelyHaveError.length > 0) {
    console.warn(
      `[WARN] ${likelyHaveError.length} AMM pools likely have bad prices/low liquidity which could have knock-on effects.`
    );
    console.log(`       Threshold: ${AMM_PRICES_CHECK_POOLS_THRESHOLD}%`);
    console.table(
      likelyHaveError.map(r => ({
        name: r.pool.name,
        diff: `${r.percentDiff.toFixed(2)}%`,
        oracle0: r.pool.lp0.oracleId,
        price0: `$${r.lp0Price}`,
        value0: `$${r.lp0Value.toNumber()}`,
        oracle1: r.pool.lp1.oracleId,
        price1: `$${r.lp1Price}`,
        value1: `$${r.lp1Value.toNumber()}`,
      }))
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
  chainId?: ChainId;
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

async function fetchChainPools(chain: ChainId, pools: Pool[]): Promise<PoolData[]> {
  if (pools.length === 0) {
    return [];
  }
  const multicallContract = fetchContract(MULTICALLS.get(chain), BeefyPriceMulticall, chain);
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
  if (failed.length > 0) {
    // TODO old js code would set totalSupply/balance to `new BigNumber(undefined)` if a batch failed,
    // which is equivalent to NaN, so we just throw here instead.
    console.error(failed);
    throw new Error(`Failed to fetch data for ${failed.length} pools on chain ${chain}`);
  }

  return results.filter(isContextResultFulfilled).map(r => r.value);
}
