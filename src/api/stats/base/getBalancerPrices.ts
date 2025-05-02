import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { BASE_CHAIN_ID as chainId } from '../../../constants';
import auraPools from '../../../data/base/auraLpPools.json';
import auraV3pools from '../../../data/base/auraV3pools.json';
import balancerV3Pools from '../../../data/base/balancerV3pools.json';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices';

const pools = [...auraPools];
const v3pools = [...auraV3pools, ...balancerV3Pools];

const getBalancerBasePrices = async tokenPrices => {
  const prices = await getBalancerPrices(chainId, pools, tokenPrices);
  const pricesV3 = await getBalancerV3Prices(chainId, v3pools, tokenPrices);
  return { ...prices, ...pricesV3 };
};

export default getBalancerBasePrices;
