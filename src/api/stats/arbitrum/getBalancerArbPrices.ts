import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants.ts';
import getBalancerPrices from '../common/balancer/getBalancerPrices.js';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices.js';
import auraPools from '../../../data/arbitrum/auraLpPools.json' with { type: 'json' };
import auraV3Pools from '../../../data/arbitrum/auraV3Pools.json' with { type: 'json' };
import balancerV3Pools from '../../../data/arbitrum/balancerV3Pools.json' with { type: 'json' };

const pools = [...auraPools];
const v3Pools = [...auraV3Pools, ...balancerV3Pools];

const getBalancerArbPrices = async tokenPrices => {
  const prices = await getBalancerPrices(chainId, pools, tokenPrices);
  const pricesV3 = await getBalancerV3Prices(chainId, v3Pools, tokenPrices);
  return { ...prices, ...pricesV3 };
};

export default getBalancerArbPrices;
