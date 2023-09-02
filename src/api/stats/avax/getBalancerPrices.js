import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { AVAX_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/avax/balancerLpPools.json';

const pools = [...balancerPools];

const getBalancerAvaxPrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBalancerAvaxPrices;
