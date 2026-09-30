import type { PricesById } from '../../../types/prices.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices.ts';
import balancerV3Pools from '../../../data/ethereum/balancerV3pools.json' with { type: 'json' };

const getAuraBalancerPrices = async (tokenPrices: PricesById) => {
  return getBalancerV3Prices(ApiChainId.ethereum, balancerV3Pools, tokenPrices);
};

export default getAuraBalancerPrices;
