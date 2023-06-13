import getBalancerPrices from '../common/getBalancerPrices';
import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants';
import beetsPools from '../../../data/optimism/beethovenxLpPools.json';
import balancerPools from '../../../data/optimism/balancerOpLpPools.json';

const pools = [...beetsPools, ...balancerPools];

const getBeetsOPPrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBeetsOPPrices;
