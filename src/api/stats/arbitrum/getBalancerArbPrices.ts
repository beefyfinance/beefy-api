import getBalancerPrices from '../common/getBalancerPrices';
import { arbitrumWeb3 as web3 } from '../../../utils/web3';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/arbitrum/balancerArbLpPools.json';
import { TokenPrices } from '../../../types/TokenPrice';

const pools = [...balancerPools];

const getBalancerArbPrices = async (tokenPrices: TokenPrices) => {
  return await getBalancerPrices(web3, chainId, pools, tokenPrices);
};

export default getBalancerArbPrices;
