import { LINEA_CHAIN_ID as chainId } from '../../../constants.ts';
import type { PricesById } from '../../../types/prices.ts';
import getGammaPrices from '../common/getGammaPrices.ts';
import ichiPools from '../../../data/linea/lynexIchiPools.json' with { type: 'json' };

const pools = [...ichiPools];
const getGammaLineaPrices = async (tokenPrices: PricesById) => {
  return await getGammaPrices(chainId, pools, tokenPrices);
};

export default getGammaLineaPrices;
