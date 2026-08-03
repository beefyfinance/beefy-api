import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import { default as ERC20Abi } from '../../../../abis/ERC20Abi.ts';
import { default as IBalancerVaultV3 } from '../../../../abis/IBalancerVaultV3.ts';
import type { PricesById, StandardLpBreakdown } from '../../../../types/prices.ts';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { isFiniteNumber } from '../../../../utils/number.ts';
import { contextAllSettled, isContextResultRejected } from '../../../../utils/promise.ts';
import { withTracing } from '../../../../utils/tracing.ts';
import { fetchContract } from '../../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', component: 'balancer-v3' });

export type BalancerV3PriceToken = {
  oracleId?: string;
  decimals: string;
};

type BalancerV3PricePoolFields = {
  name: string;
  address: string;
  decimals: string;
  tokens: BalancerV3PriceToken[];
};

type NotComposable = {
  composable?: false | undefined;
  bptIndex?: number;
};

type Composable = {
  composable: boolean;
  bptIndex: number;
};

export type BalancerV3PricePool = BalancerV3PricePoolFields & (NotComposable | Composable);

type BalancerV3PoolReads = {
  tokenAddresses: readonly Address[];
  balance: BigNumber[];
  totalSupply: BigNumber;
};

const getBalancerV3Prices = withTracing(
  async (chainId: ChainId, pools: BalancerV3PricePool[], tokenPrices: PricesById) => {
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

const getPoolsData = (chainId: ChainId, pools: BalancerV3PricePool[]) =>
  contextAllSettled(pools, async (pool): Promise<BalancerV3PoolReads> => {
    const [[tokenAddresses, /* tokenInfo */ , balancesRaw], totalSupply] = await Promise.all([
      fetchContract(pool.address, IBalancerVaultV3, chainId).read.getTokenInfo(),
      fetchContract(pool.address, ERC20Abi, chainId).read.totalSupply(),
    ]);

    return {
      tokenAddresses,
      balance: balancesRaw.map(v => new BigNumber(v)),
      totalSupply: new BigNumber(totalSupply),
    };
  });

const getPoolPrice = (
  chainId: ChainId,
  pool: BalancerV3PricePool,
  { tokenAddresses, balance, totalSupply }: BalancerV3PoolReads,
  tokenPrices: PricesById
): StandardLpBreakdown | undefined => {
  const fields = { chain: chainId, pool: pool.name };
  let totalStakedinUsd = new BigNumber(0);
  const shiftedBalances = [];
  const tokens = [];
  for (let i = 0; i < pool.tokens.length; i++) {
    // a composable pool holds its own bpt, which is not part of its backing
    if (pool.composable && i === pool.bptIndex) {
      continue;
    }

    const { oracleId, decimals } = pool.tokens[i];
    if (!oracleId || !decimals) {
      logger.warn({ ...fields, index: i }, 'pool token missing oracleId or decimals');
      return undefined;
    }

    // every token has to be priced
    const tokenPrice = tokenPrices[oracleId];
    if (!isFiniteNumber(tokenPrice) || tokenPrice <= 0) {
      logger.warn({ ...fields, token: oracleId }, 'missing token price');
      return undefined;
    }

    totalStakedinUsd = totalStakedinUsd.plus(balance[i].times(tokenPrice).dividedBy(decimals));
    shiftedBalances.push(balance[i].dividedBy(decimals).toString(10));
    tokens.push(tokenAddresses[i]);
  }

  const supply = pool.composable ? totalSupply.minus(balance[pool.bptIndex]) : totalSupply;
  const price = totalStakedinUsd.times(pool.decimals).dividedBy(supply).toNumber();
  if (!isFiniteNumber(price) || price <= 0) {
    logger.warn({ ...fields, price, supply: supply.toString(10) }, 'invalid price calculated');
    return undefined;
  }

  return {
    price,
    tokens: tokens,
    balances: shiftedBalances,
    totalSupply: supply.dividedBy(pool.decimals).toString(10),
  };
};

export default getBalancerV3Prices;
