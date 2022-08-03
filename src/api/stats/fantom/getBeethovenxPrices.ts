import getBalancerPrices from '../common/getBalancerPrices';
import { fantomWeb3 as web3 } from '../../../utils/web3';
import { FANTOM_CHAIN_ID } from '../../../constants';
import beetsPools from '../../../data/fantom/beethovenxPools.json';
import beetsDualPools from '../../../data/fantom/beethovenxDualPools.json';
import fBeetsPool from '../../../data/fantom/fBeetsPool.json';

const pools = [...beetsPools, ...fBeetsPool, ...beetsDualPools];

const getBeethovenxPrices = async tokenPrices => {
  return await getBalancerPrices(web3, FANTOM_CHAIN_ID, pools, tokenPrices);
};

export default getBeethovenxPrices;
