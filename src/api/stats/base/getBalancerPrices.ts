import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { BASE_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/base/balancerPools.json';

const pools = [...balancerPools];

const getBalancerBasePrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBalancerBasePrices;
