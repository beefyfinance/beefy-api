import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { SONIC_CHAIN_ID as chainId } from '../../../constants';
import beetsPools from '../../../data/sonic/beetsPools.json';

const pools = [...beetsPools];

const getBeetsSonicPrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBeetsSonicPrices;
