import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import { default as ISolidlyPair } from '../../../abis/ISolidlyPair.ts';
import type { LpPool } from '../../../types/LpPool.ts';
import type { PricesById, StandardLpBreakdown } from '../../../types/prices.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { withTracing } from '../../../utils/tracing.ts';
import { fetchContract } from '../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', component: 'solidly-stable' });

const getSolidlyStablePrices = withTracing(
  async (chainId: ChainId, pools: LpPool[], tokenPrices: PricesById) => {
    let prices: Record<string, StandardLpBreakdown> = {};

    const [reserveCalls, supplyCalls] = pools.reduce<[Promise<readonly [bigint, bigint, bigint]>[], Promise<bigint>[]]>(
      (acc, pool) => {
        const contract = fetchContract(pool.address, ISolidlyPair, chainId);
        acc[0].push(contract.read.getReserves());
        acc[1].push(contract.read.totalSupply());
        return acc;
      },
      [[], []]
    );

    const [reserveResults, supplyResults] = await Promise.all([Promise.all(reserveCalls), Promise.all(supplyCalls)]);

    const poolsData = reserveResults.map((_, i) => {
      return {
        lp0Bal: new BigNumber(reserveResults[i][0]),
        lp1Bal: new BigNumber(reserveResults[i][1]),
        totalSupply: new BigNumber(supplyResults[i]),
      };
    });

    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      const lp0Bal = poolsData[i].lp0Bal;
      const lp1Bal = poolsData[i].lp1Bal;
      const totalSupply = poolsData[i].totalSupply;

      const lp0 = lp0Bal.multipliedBy(tokenPrices[pool.lp0.oracleId] ?? 0).dividedBy(pool.lp0.decimals);
      const lp1 = lp1Bal.multipliedBy(tokenPrices[pool.lp1.oracleId] ?? 0).dividedBy(pool.lp1.decimals);
      const price = lp0.plus(lp1).multipliedBy(pool.decimals).dividedBy(totalSupply).toNumber();

      prices[pool.name] = {
        price,
        tokens: [pool.lp0.address, pool.lp1.address],
        balances: [lp0Bal.dividedBy(pool.lp0.decimals).toString(10), lp1Bal.dividedBy(pool.lp1.decimals).toString(10)],
        totalSupply: totalSupply.dividedBy(pool.decimals).toString(10),
      };
    }
    return prices;
  },
  { logger, fieldsFn: (chainId: ChainId) => ({ chain: chainId }) }
);

export default getSolidlyStablePrices;
