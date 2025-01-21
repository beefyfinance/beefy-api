import { getGmxPrices } from '../common/gmx/getGmxPrices';
import { AVAX_CHAIN_ID as chainId } from '../../../constants';
import pools from '../../../data/avax/gmxPools.json';

export const getGmxAvalanchePrices = async tokenPrices => {
  return await getGmxPrices(chainId, pools, tokenPrices);
};
