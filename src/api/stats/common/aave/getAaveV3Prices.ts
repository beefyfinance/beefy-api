import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import ERC20Abi from '../../../../abis/ERC20Abi.ts';
import type { PricesById, StandardLpBreakdown } from '../../../../types/prices.ts';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { withTracing } from '../../../../utils/tracing.ts';
import { fetchContract } from '../../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', component: 'aave-v3' });

export type AaveV3PricePool = {
  name: string;
  aToken: string;
  oracleId: string;
  decimals: string;
};

export const getAaveV3Prices = withTracing(
  async (chainId: ChainId, pools: AaveV3PricePool[], tokenPrices: PricesById) => {
    const supplyCalls = pools.map(pool => fetchContract(pool.aToken, ERC20Abi, chainId).read.totalSupply());
    const [supplyRes] = await Promise.all([Promise.all(supplyCalls)]);

    let prices: Record<string, StandardLpBreakdown> = {};
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      const price = tokenPrices[pool.oracleId];
      const totalSupply = new BigNumber(supplyRes[i]).div(pool.decimals).toString(10);
      prices[pool.name] = {
        price,
        totalSupply,
        tokens: [],
        balances: [],
      };
    }
    return prices;
  },
  { logger, fieldsFn: (chainId: ChainId) => ({ chain: chainId }) }
);
