import { SONIC_CHAIN_ID as chainId } from '../../../constants.ts';
import getBalancerPrices from '../common/balancer/getBalancerPrices.js';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices.js';
import beetsPools from '../../../data/sonic/beetsPools.json' with { type: 'json' };
import beetsV3Pools from '../../../data/sonic/beetsV3Pools.json' with { type: 'json' };

const getBeetsSonicPrices = async tokenPrices => {
  const data = await getBalancerPrices(chainId, beetsPools, tokenPrices);
  const dataV3 = await getBalancerV3Prices(chainId, beetsV3Pools, tokenPrices);

  return { ...data, ...dataV3 };
};

export default getBeetsSonicPrices;
