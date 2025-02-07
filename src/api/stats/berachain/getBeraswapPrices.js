import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { BERACHAIN_CHAIN_ID as chainId } from '../../../constants';
import beraswapPools from '../../../data/berachain/beraswapPools.json';

const getBeraswapPrices = async tokenPrices => {
  const data = await getBalancerPrices(chainId, beraswapPools, tokenPrices);

  return data;
};

export default getBeraswapPrices;
