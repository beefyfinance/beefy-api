import type { PricesById } from '../../../types/prices.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices.ts';
import auraV3Pools from '../../../data/optimism/auraV3Pools.json' with { type: 'json' };
import balancerV3Pools from '../../../data/optimism/balancerV3.json' with { type: 'json' };

const v3Pools = [...auraV3Pools, ...balancerV3Pools];

const getBeetsOPPrices = async (tokenPrices: PricesById) => {
  const pricesV3 = await getBalancerV3Prices(ApiChainId.optimism, v3Pools, tokenPrices);
  return { ...pricesV3 };
};

export default getBeetsOPPrices;
