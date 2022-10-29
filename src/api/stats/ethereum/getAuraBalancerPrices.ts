import getBalancerPrices from '../common/getBalancerPrices';
import { ethereumWeb3 as web3 } from '../../../utils/web3';
import { ETH_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/ethereum/auraBalancerLpPools.json';

const pools = [...balancerPools];

const getAuraBalancerPrices = async tokenPrices => {
  return await getBalancerPrices(web3, chainId, pools, tokenPrices);
};

export default getAuraBalancerPrices;
