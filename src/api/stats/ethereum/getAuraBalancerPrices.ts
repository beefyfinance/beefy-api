import { ETH_CHAIN_ID as chainId } from '../../../constants.ts';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices.js';
import balancerV3Pools from '../../../data/ethereum/balancerV3pools.json' with { type: 'json' };

const getAuraBalancerPrices = async tokenPrices => {
  return getBalancerV3Prices(chainId, balancerV3Pools, tokenPrices);
};

export default getAuraBalancerPrices;
