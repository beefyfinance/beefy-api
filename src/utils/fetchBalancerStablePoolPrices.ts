import getBalancerPrices from '../api/stats/common/balancer/getBalancerPrices.ts';
import type { PricesById } from '../types/prices.ts';
import { ApiChainId } from './chain.ts';
import { getLoggerFor } from './logger/index.ts';
import { withTracing } from './tracing.ts';
import balancerLinearPools from '../data/ethereum/balancerLinearPools.json' with { type: 'json' };

const logger = getLoggerFor({ module: 'prices', component: 'balancer-linear' });

const fetchBalancerLinearPoolPrice = withTracing(
  async (tokenPrices: PricesById): Promise<PricesById> => {
    const results = await getBalancerPrices(ApiChainId.ethereum, balancerLinearPools, tokenPrices);
    return Object.fromEntries(Object.entries(results).map(([key, value]) => [key, value.price]));
  },
  { logger }
);

export { fetchBalancerLinearPoolPrice };
