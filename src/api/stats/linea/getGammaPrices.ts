import type { PricesById } from '../../../types/prices.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import getGammaPrices from '../common/getGammaPrices.ts';
import ichiPools from '../../../data/linea/lynexIchiPools.json' with { type: 'json' };

const pools = [...ichiPools];
const getGammaLineaPrices = async (tokenPrices: PricesById) => {
  return await getGammaPrices(ApiChainId.linea, pools, tokenPrices);
};

export default getGammaLineaPrices;
