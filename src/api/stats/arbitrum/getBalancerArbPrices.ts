import getBalancerPrices from '../common/getBalancerPrices';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/arbitrum/balancerArbLpPools.json';

const pools = [...balancerPools];

const getBalancerArbPrices = async tokenPrices => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBalancerArbPrices;
