import { AVAX_CHAIN_ID as chainId } from '../../../constants.ts';
import { getGmxPrices } from '../common/gmx/getGmxPrices.ts';
import pools from '../../../data/avax/gmxPools.json' with { type: 'json' };

export const getGmxAvalanchePrices = async tokenPrices => {
  return await getGmxPrices(chainId, pools, tokenPrices);
};
