import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { GNOSIS_CHAIN_ID as chainId } from '../../../constants';
import auraPools from '../../../data/gnosis/auraPools.json';

const pools = [...auraPools];

const getBalancerGnosisPrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBalancerGnosisPrices;
