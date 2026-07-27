import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants.ts';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices.js';
import auraV3Pools from '../../../data/optimism/auraV3Pools.json' with { type: 'json' };
import balancerV3Pools from '../../../data/optimism/balancerV3.json' with { type: 'json' };

const v3Pools = [...auraV3Pools, ...balancerV3Pools];

const getBeetsOPPrices = async tokenPrices => {
  const pricesV3 = await getBalancerV3Prices(chainId, v3Pools, tokenPrices);
  return { ...pricesV3 };
};

export default getBeetsOPPrices;
