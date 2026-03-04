import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { MONAD_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/monad/balancerMonadLpPools.json';
import balancerV3Pools from '../../../data/monad/balancerV3pools.json';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices';

const pools = [...balancerPools];
const v3pools = [...balancerV3Pools];

const getBalancerMonadPrices = async tokenPrices => {
  const prices = await getBalancerPrices(chainId, pools, tokenPrices);
  const pricesV3 = await getBalancerV3Prices(chainId, v3pools, tokenPrices);
  return { ...prices, ...pricesV3 };
};

export default getBalancerMonadPrices;
