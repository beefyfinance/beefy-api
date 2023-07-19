import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { ETH_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/ethereum/auraBalancerLpPools.json';

const pools = [...balancerPools];

const getAuraBalancerPrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getAuraBalancerPrices;
