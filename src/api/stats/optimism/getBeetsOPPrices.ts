import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants';
import beetsPools from '../../../data/optimism/beethovenxLpPools.json';
import balancerPools from '../../../data/optimism/balancerOpLpPools.json';
import auraPools from '../../../data/optimism/auraLpPools.json';

const pools = [...beetsPools, ...balancerPools, ...auraPools];

const getBeetsOPPrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBeetsOPPrices;
