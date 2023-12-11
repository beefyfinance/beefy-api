import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { BASE_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/base/balancerPools.json';
import auraPools from '../../../data/base/auraLpPools.json';

const pools = [...balancerPools, ...auraPools];

const getBalancerBasePrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBalancerBasePrices;
