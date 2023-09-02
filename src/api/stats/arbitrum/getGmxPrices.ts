import { getGmxPrices } from '../common/gmx/getGmxPrices';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import pools from '../../../data/arbitrum/gmxPools.json';

export const getGmxArbitrumPrices = async tokenPrices => {
  return await getGmxPrices(chainId, pools, tokenPrices);
};
