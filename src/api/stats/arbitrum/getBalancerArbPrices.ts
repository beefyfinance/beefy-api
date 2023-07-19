import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/arbitrum/balancerArbLpPools.json';
import auraPools from '../../../data/arbitrum/auraLpPools.json';

const pools = [...balancerPools, ...auraPools];

const getBalancerArbPrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBalancerArbPrices;
