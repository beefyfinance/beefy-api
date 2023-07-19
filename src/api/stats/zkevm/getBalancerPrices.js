import getBalancerPrices from '../common/balancer/getBalancerPrices';
import { zkevmWeb3 as web3 } from '../../../utils/web3';
import { ZKEVM_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/zkevm/balancerPools.json';

const pools = [...balancerPools];

const getBalancerZkevmPrices = async tokenPrices => {
  return await getBalancerPrices(web3, chainId, pools, tokenPrices);
};

export default getBalancerZkevmPrices;
