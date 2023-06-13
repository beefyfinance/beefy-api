import getBalancerPrices from '../common/getBalancerPrices';
import { POLYGON_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/matic/balancerPolyLpPools.json';

const pools = [...balancerPools];

const getBalancerPolyPrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBalancerPolyPrices;
