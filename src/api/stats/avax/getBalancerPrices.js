import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { AVAX_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/avax/balancerLpPools.json';
import auraPools from '../../../data/avax/auraLpPools.json';
import balancerV3Pools from '../../../data/avax/balancerV3Pools.json';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices';

const pools = [...balancerPools, ...auraPools];

const getBalancerAvaxPrices = async tokenPrices => {
  const prices = await getBalancerPrices(chainId, pools, tokenPrices);
  const pricesV3 = await getBalancerV3Prices(chainId, balancerV3Pools, tokenPrices);
  return { ...prices, ...pricesV3 };
};

export default getBalancerAvaxPrices;
