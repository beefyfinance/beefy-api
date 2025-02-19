import getBalancerPrices from '../common/balancer/getBalancerPrices';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices';
import { ETH_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/ethereum/auraBalancerLpPools.json';
import balancerV3Pools from '../../../data/ethereum/balancerV3pools.json';

const getAuraBalancerPrices = async tokenPrices => {
  const prices = await getBalancerPrices(chainId, balancerPools, tokenPrices);
  const pricesV3 = await getBalancerV3Prices(chainId, balancerV3Pools, tokenPrices);
  return { ...prices, ...pricesV3 };
};

export default getAuraBalancerPrices;
