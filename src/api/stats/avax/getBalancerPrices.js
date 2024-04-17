import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { AVAX_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/avax/balancerLpPools.json';
import auraPools from '../../../data/avax/auraLpPools.json';

const pools = [...balancerPools, ...auraPools];

const getBalancerAvaxPrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBalancerAvaxPrices;
