import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { BERACHAIN_CHAIN_ID as chainId } from '../../../constants';
import beraswapPools from '../../../data/berachain/beraswapPools.json';
import beraPawPools from '../../../data/berachain/hubBeraPawPools.json';

export const getBeraswapPrices = async tokenPrices => {
  return getBalancerPrices(chainId, [...beraswapPools, ...beraPawPools], tokenPrices);
};
