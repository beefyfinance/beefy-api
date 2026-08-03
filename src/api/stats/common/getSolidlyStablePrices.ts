import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import { default as ISolidlyPair } from '../../../abis/ISolidlyPair.ts';
import type { LpPool } from '../../../types/LpPool.ts';
import type { PricesById, StandardLpBreakdown } from '../../../types/prices.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { isFiniteNumber } from '../../../utils/number.ts';
import { contextAllSettled, isContextResultRejected } from '../../../utils/promise.ts';
import { withTracing } from '../../../utils/tracing.ts';
import { fetchContract } from '../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', component: 'solidly-stable' });

type SolidlyPoolReads = {
  lp0Bal: BigNumber;
  lp1Bal: BigNumber;
  totalSupply: BigNumber;
};

const getSolidlyStablePrices = withTracing(
  async (chainId: ChainId, pools: LpPool[], tokenPrices: PricesById) => {
    const prices: Record<string, StandardLpBreakdown> = {};

    for (const result of await getPoolsData(chainId, pools)) {
      if (isContextResultRejected(result)) {
        logger.warn({ chain: chainId, pool: result.context.name, err: result.reason }, 'failed to read pool data');
        continue;
      }

      const breakdown = getPoolPrice(chainId, result.context, result.value, tokenPrices);
      if (breakdown) {
        prices[result.context.name] = breakdown;
      }
    }

    return prices;
  },
  { logger, fieldsFn: (chainId: ChainId) => ({ chain: chainId }) }
);

const getPoolsData = (chainId: ChainId, pools: LpPool[]) =>
  contextAllSettled(pools, async (pool): Promise<SolidlyPoolReads> => {
    const contract = fetchContract(pool.address, ISolidlyPair, chainId);
    const [[reserve0, reserve1], totalSupply] = await Promise.all([
      contract.read.getReserves(),
      contract.read.totalSupply(),
    ]);

    return {
      lp0Bal: new BigNumber(reserve0),
      lp1Bal: new BigNumber(reserve1),
      totalSupply: new BigNumber(totalSupply),
    };
  });

const getPoolPrice = (
  chainId: ChainId,
  pool: LpPool,
  { lp0Bal, lp1Bal, totalSupply }: SolidlyPoolReads,
  tokenPrices: PricesById
): StandardLpBreakdown | undefined => {
  const fields = { chain: chainId, pool: pool.name };

  const lp0Price = tokenPrices[pool.lp0.oracleId];
  if (!isFiniteNumber(lp0Price) || lp0Price <= 0) {
    logger.warn({ ...fields, token: pool.lp0.oracleId }, 'missing token price');
    return undefined;
  }

  const lp1Price = tokenPrices[pool.lp1.oracleId];
  if (!isFiniteNumber(lp1Price) || lp1Price <= 0) {
    logger.warn({ ...fields, token: pool.lp1.oracleId }, 'missing token price');
    return undefined;
  }

  const lp0 = lp0Bal.multipliedBy(lp0Price).dividedBy(pool.lp0.decimals);
  const lp1 = lp1Bal.multipliedBy(lp1Price).dividedBy(pool.lp1.decimals);
  const price = lp0.plus(lp1).multipliedBy(pool.decimals).dividedBy(totalSupply).toNumber();
  if (!isFiniteNumber(price) || price <= 0) {
    logger.warn({ ...fields, price, totalSupply: totalSupply.toString(10) }, 'invalid price calculated');
    return undefined;
  }

  return {
    price,
    tokens: [pool.lp0.address, pool.lp1.address],
    balances: [lp0Bal.dividedBy(pool.lp0.decimals).toString(10), lp1Bal.dividedBy(pool.lp1.decimals).toString(10)],
    totalSupply: totalSupply.dividedBy(pool.decimals).toString(10),
  };
};

export default getSolidlyStablePrices;
