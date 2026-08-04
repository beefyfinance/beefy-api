import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address, Hex } from 'viem';
import { default as ERC20Abi } from '../../../../abis/ERC20Abi.ts';
import { default as IBalancerVault } from '../../../../abis/IBalancerVault.ts';
import type { PricesById, StandardLpBreakdown } from '../../../../types/prices.ts';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { isValidPrice } from '../../../../utils/prices.ts';
import { contextAllSettled, isContextResultRejected } from '../../../../utils/promise.ts';
import { withTracing } from '../../../../utils/tracing.ts';
import { fetchContract } from '../../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', component: 'balancer-v2' });

export type BalancerPriceToken = {
  oracleId?: string;
  decimals?: string;
};

type BalancerPricePoolFields = {
  name: string;
  address: string;
  vault: string;
  vaultPoolId: string;
  decimals: string;
  tokens: BalancerPriceToken[];
};

type NotComposable = {
  composable?: false | undefined;
  bptIndex?: number;
};

type Composable = {
  composable: boolean;
  bptIndex: number;
};

export type BalancerPricePool = BalancerPricePoolFields & (NotComposable | Composable);

type BalancerPoolReads = {
  tokenAddresses: readonly Address[];
  balance: BigNumber[];
  totalSupply: BigNumber;
};

const getBalancerPrices = withTracing(
  async (chainId: ChainId, pools: BalancerPricePool[], tokenPrices: PricesById) => {
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

const getPoolsData = (chainId: ChainId, pools: BalancerPricePool[]) =>
  contextAllSettled(pools, async (pool): Promise<BalancerPoolReads> => {
    const [[tokenAddresses, balances], totalSupply] = await Promise.all([
      fetchContract(pool.vault, IBalancerVault, chainId).read.getPoolTokens([pool.vaultPoolId as Hex]),
      fetchContract(pool.address, ERC20Abi, chainId).read.totalSupply(),
    ]);

    return {
      tokenAddresses,
      balance: balances.map(v => new BigNumber(v)),
      totalSupply: new BigNumber(totalSupply),
    };
  });

const getPoolPrice = (
  chainId: ChainId,
  pool: BalancerPricePool,
  { tokenAddresses, balance, totalSupply }: BalancerPoolReads,
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
    if (!isValidPrice(tokenPrice)) {
      logger.warn({ ...fields, oracleId }, 'missing token price');
      return undefined;
    }

    totalStakedinUsd = totalStakedinUsd.plus(balance[i].times(tokenPrice).dividedBy(decimals));
    shiftedBalances.push(balance[i].dividedBy(decimals).toString(10));
    tokens.push(tokenAddresses[i]);
  }

  const supply = pool.composable ? totalSupply.minus(balance[pool.bptIndex]) : totalSupply;
  const price = totalStakedinUsd.times(pool.decimals).dividedBy(supply).toNumber();
  if (!isValidPrice(price)) {
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

export default getBalancerPrices;
