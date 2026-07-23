import { LINEA_CHAIN_ID as chainId } from '../../../constants.ts';
import getGammaPrices from '../common/getGammaPrices.js';
import ichiPools from '../../../data/linea/lynexIchiPools.json' with { type: 'json' };

const pools = [...ichiPools];
const getGammaLineaPrices = async tokenPrices => {
  return await getGammaPrices(chainId, pools, tokenPrices);
};

export default getGammaLineaPrices;
