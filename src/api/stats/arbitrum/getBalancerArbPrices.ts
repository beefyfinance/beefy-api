import getBalancerPrices from '../common/balancer/getBalancerPrices';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/arbitrum/balancerArbLpPools.json';
import auraPools from '../../../data/arbitrum/auraLpPools.json';
import auraV3Pools from '../../../data/arbitrum/auraV3Pools.json';
import balancerV3Pools from '../../../data/arbitrum/balancerV3Pools.json';

const pools = [...balancerPools, ...auraPools];
const v3Pools = [...auraV3Pools, ...balancerV3Pools];

const getBalancerArbPrices = async tokenPrices => {
  const prices = await getBalancerPrices(chainId, pools, tokenPrices);
  const pricesV3 = await getBalancerV3Prices(chainId, v3Pools, tokenPrices);
  return { ...prices, ...pricesV3 };
};

export default getBalancerArbPrices;
