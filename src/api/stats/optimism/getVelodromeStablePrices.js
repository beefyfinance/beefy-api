import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';
import newPools from '../../../data/optimism/velodromeStableLpPools.json' with { type: "json" };
import oldPools from '../../../data/optimism/oldVelodromeStableLpPools.json' with { type: "json" };
import { OPTIMISM_CHAIN_ID } from '../../../constants.ts';

const pools = [...oldPools, ...newPools];
const getVelodromeStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

export default getVelodromeStablePrices;
