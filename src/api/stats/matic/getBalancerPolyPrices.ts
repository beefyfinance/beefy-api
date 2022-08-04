import getBalancerPrices from '../common/getBalancerPrices';
import { polygonWeb3 as web3 } from '../../../utils/web3';
import { POLYGON_CHAIN_ID as chainId } from '../../../constants';
import balancerPools from '../../../data/matic/balancerPolyLpPools.json';

const pools = [...balancerPools];

const getBalancerPolyPrices = async tokenPrices => {
  return await getBalancerPrices(web3, chainId, pools, tokenPrices);
};

export default getBalancerPolyPrices;
