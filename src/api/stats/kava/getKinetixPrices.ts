import { getGmxPrices } from '../common/gmx/getGmxPrices';
import { KAVA_CHAIN_ID as chainId } from '../../../constants';
import pools from '../../../data/kava/kinetixPools.json';

export const getKinetixPrices = async tokenPrices => {
  return await getGmxPrices(chainId, pools, tokenPrices);
};
