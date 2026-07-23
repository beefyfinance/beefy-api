import { OPTIMISM_CHAIN_ID } from '../../../constants.ts';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';
import oldPools from '../../../data/optimism/oldVelodromeStableLpPools.json' with { type: 'json' };
import newPools from '../../../data/optimism/velodromeStableLpPools.json' with { type: 'json' };

const pools = [...oldPools, ...newPools];
const getVelodromeStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

export default getVelodromeStablePrices;
