import getBalancerPrices from '../common/balancer/getBalancerPrices';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices';
import { GNOSIS_CHAIN_ID as chainId } from '../../../constants';
import auraPools from '../../../data/gnosis/auraPools.json';
import balancerV3Pools from '../../../data/gnosis/balancerV3Pools.json';

const pools = [...auraPools];
const v3Pools = [...balancerV3Pools];

const getBalancerGnosisPrices = async tokenPrices => {
  const data = await getBalancerPrices(chainId, pools, tokenPrices);
  const dataV3 = await getBalancerV3Prices(chainId, v3Pools, tokenPrices);

  return { ...data, ...dataV3 };
};

export default getBalancerGnosisPrices;
