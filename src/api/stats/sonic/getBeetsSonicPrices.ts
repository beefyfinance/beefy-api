import type { PricesById } from '../../../types/prices.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import getBalancerPrices from '../common/balancer/getBalancerPrices.ts';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices.ts';
import beetsPools from '../../../data/sonic/beetsPools.json' with { type: 'json' };
import beetsV3Pools from '../../../data/sonic/beetsV3Pools.json' with { type: 'json' };

const chainId = ApiChainId.sonic;

const getBeetsSonicPrices = async (tokenPrices: PricesById) => {
  const data = await getBalancerPrices(chainId, beetsPools, tokenPrices);
  const dataV3 = await getBalancerV3Prices(chainId, beetsV3Pools, tokenPrices);

  return { ...data, ...dataV3 };
};

export default getBeetsSonicPrices;
