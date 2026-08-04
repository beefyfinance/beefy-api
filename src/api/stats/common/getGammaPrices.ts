import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import ThenaLPAbi from '../../../abis/bsc/ThenaLP.ts';
import type { LpToken } from '../../../types/LpPool.ts';
import type { PricesById, StandardLpBreakdown } from '../../../types/prices.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { withTracing } from '../../../utils/tracing.ts';
import { fetchContract } from '../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', component: 'gamma' });

export type GammaPool = {
  name: string;
  address: string;
  lp0: LpToken;
  lp1: LpToken;
};

type GammaTotalAmounts = readonly [bigint, bigint];

export const getGammaPrices = withTracing(
  async (chainId: ChainId, pools: GammaPool[], tokenPrices: PricesById) => {
    const [amountCalls, totalSupplyCalls] = pools.reduce<[Promise<GammaTotalAmounts>[], Promise<bigint>[]]>(
      (acc, pool) => {
        const contract = fetchContract(pool.address, ThenaLPAbi, chainId);
        acc[0].push(contract.read.getTotalAmounts());
        acc[1].push(contract.read.totalSupply());
        return acc;
      },
      [[], []]
    );

    const [amountResults, totalSupplyResults] = await Promise.all([
      Promise.all(amountCalls),
      Promise.all(totalSupplyCalls),
    ]);

    let prices: Record<string, StandardLpBreakdown> = {};
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      const lp0 = pool.lp0;
      const lp1 = pool.lp1;
      const bal0 = new BigNumber(amountResults[i][0]).div(lp0.decimals);
      const bal1 = new BigNumber(amountResults[i][1]).div(lp1.decimals);
      const totalSupply = new BigNumber(totalSupplyResults[i]).div('1e18');

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
  { logger, fieldsFn: (chainId: ChainId) => ({ chain: chainId }) }
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

export default getGammaPrices;
