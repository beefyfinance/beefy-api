import getBalancerPrices from '../common/balancer/getBalancerPrices';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices';
import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants';
import beetsPools from '../../../data/optimism/beethovenxLpPools.json';
import balancerPools from '../../../data/optimism/balancerOpLpPools.json';
import auraPools from '../../../data/optimism/auraLpPools.json';
import balancerV3Pools from '../../../data/optimism/balancerV3.json';

const pools = [...beetsPools, ...balancerPools, ...auraPools];

const getBeetsOPPrices = async tokenPrices => {
  const prices = await getBalancerPrices(chainId, pools, tokenPrices);
  const pricesV3 = await getBalancerV3Prices(chainId, balancerV3Pools, tokenPrices);
  return { ...prices, ...pricesV3 };
};

export default getBeetsOPPrices;
