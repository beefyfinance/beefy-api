import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { ZKEVM_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/zkevm/balancerPools.json';

const pools = [...balancerPools];

const getBalancerZkevmPrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBalancerZkevmPrices;
