import { AVAX_CHAIN_ID as chainId } from '../../../constants.ts';
import type { PricesById } from '../../../types/prices.ts';
import getBalancerPrices from '../common/balancer/getBalancerPrices.ts';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices.ts';
import auraPools from '../../../data/avax/auraLpPools.json' with { type: 'json' };
import balancerPools from '../../../data/avax/balancerLpPools.json' with { type: 'json' };
import balancerV3Pools from '../../../data/avax/balancerV3Pools.json' with { type: 'json' };

const pools = [...balancerPools, ...auraPools];

const getBalancerAvaxPrices = async (tokenPrices: PricesById) => {
  const prices = await getBalancerPrices(chainId, pools, tokenPrices);
  const pricesV3 = await getBalancerV3Prices(chainId, balancerV3Pools, tokenPrices);
  return { ...prices, ...pricesV3 };
};

export default getBalancerAvaxPrices;
