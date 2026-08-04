import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import BunniLensAbi from '../../../abis/BunniLens.ts';
import { BASE_CHAIN_ID } from '../../../constants.ts';
import type { LpToken } from '../../../types/LpPool.ts';
import type { PricesById, StandardLpBreakdown } from '../../../types/prices.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { withTracing } from '../../../utils/tracing.ts';
import { fetchContract } from '../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', component: 'bunni' });

const lens = {
  [BASE_CHAIN_ID]: '0x3eD7357337853E2Fd8d4b6CbABCDAA0858b40f01',
};

export type BunniPool = {
  name: string;
  address: string;
  lp0: LpToken;
  lp1: LpToken;
};

type BunniTokenBalances = readonly [bigint, bigint, bigint];

export const getBunniPrices = withTracing(
  async (chainId: typeof BASE_CHAIN_ID, pools: BunniPool[], tokenPrices: PricesById) => {
    const [calls] = pools.reduce<[Promise<BunniTokenBalances>[], unknown[]]>(
      (acc, pool) => {
        const contract = fetchContract(lens[chainId], BunniLensAbi, chainId);
        acc[0].push(contract.read.tokenBalances([pool.address as Address]));
        return acc;
      },
      [[], []]
    );

    const [balanceCalls] = await Promise.all([Promise.all(calls)]);

    let prices: Record<string, StandardLpBreakdown> = {};
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      const lp0 = pool.lp0;
      const lp1 = pool.lp1;
      const bal0 = new BigNumber(balanceCalls[i][0]).div(lp0.decimals);
      const bal1 = new BigNumber(balanceCalls[i][1]).div(lp1.decimals);
      const totalSupply = new BigNumber(balanceCalls[i][2]).div('1e18');

      const price0 = getTokenPrice(tokenPrices, lp0.oracleId);
      const price1 = getTokenPrice(tokenPrices, lp1.oracleId);
      const price = bal0.times(price0).plus(bal1.times(price1)).div(totalSupply).toNumber();

      prices[pool.name] = {
        price,
        tokens: [lp0.address, lp1.address],
        balances: [bal0.toString(10), bal1.toString(10)],
        totalSupply: totalSupply.toString(10),
      };
    }
    return prices;
  },
  { logger, fieldsFn: (chainId: typeof BASE_CHAIN_ID) => ({ chain: chainId }) }
);

const getTokenPrice = (tokenPrices: PricesById, oracleId: string) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    logger.warn({ oracleId: tokenSymbol }, 'unknown token, defaulting price to 1');
  }
  return tokenPrice;
};
