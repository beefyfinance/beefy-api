import type { PricesById } from '../../../types/prices.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import getBalancerPrices from '../common/balancer/getBalancerPrices.ts';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices.ts';
import balancerPools from '../../../data/monad/balancerMonadLpPools.json' with { type: 'json' };
import balancerV3Pools from '../../../data/monad/balancerV3Pools.json' with { type: 'json' };

const chainId = ApiChainId.monad;

const pools = [...balancerPools];
const v3pools = [...balancerV3Pools];

const getBalancerMonadPrices = async (tokenPrices: PricesById) => {
  const prices = await getBalancerPrices(chainId, pools, tokenPrices);
  const pricesV3 = await getBalancerV3Prices(chainId, v3pools, tokenPrices);
  return { ...prices, ...pricesV3 };
};

export default getBalancerMonadPrices;
