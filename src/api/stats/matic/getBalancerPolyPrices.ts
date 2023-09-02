import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { POLYGON_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/matic/balancerPolyLpPools.json';
import auraPools from '../../../data/matic/auraLpPools.json';

const pools = [...balancerPools, ...auraPools];

const getBalancerPolyPrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBalancerPolyPrices;
