import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { FANTOM_CHAIN_ID } from '../../../constants';
import beetsPools from '../../../data/fantom/beethovenxPools.json';
import beetsDualPools from '../../../data/fantom/beethovenxDualPools.json';

const pools = [...beetsPools, ...beetsDualPools];

const getBeethovenxPrices = async tokenPrices => {
  return await getBalancerPrices(FANTOM_CHAIN_ID, pools, tokenPrices);
};

export default getBeethovenxPrices;
