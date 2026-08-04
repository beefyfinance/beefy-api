import { BASE_CHAIN_ID as chainId } from '../../../constants.ts';
import type { PricesById } from '../../../types/prices.ts';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices.ts';
import auraV3pools from '../../../data/base/auraV3pools.json' with { type: 'json' };

const v3pools = [...auraV3pools];

const getBalancerBasePrices = async (tokenPrices: PricesById) => {
  const pricesV3 = await getBalancerV3Prices(chainId, v3pools, tokenPrices);
  return { ...pricesV3 };
};

export default getBalancerBasePrices;
