import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { optimismWeb3 as web3 } from '../../../utils/web3';
import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants';
import beetsPools from '../../../data/optimism/beethovenxLpPools.json';
import balancerPools from '../../../data/optimism/balancerOpLpPools.json';

const pools = [...beetsPools, ...balancerPools];

const getBeetsOPPrices = async tokenPrices => {
  return await getBalancerPrices(web3, chainId, pools, tokenPrices);
};

export default getBeetsOPPrices;
