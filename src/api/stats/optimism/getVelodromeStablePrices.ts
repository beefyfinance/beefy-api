import { OPTIMISM_CHAIN_ID } from '../../../constants.ts';
import type { PricesById } from '../../../types/prices.ts';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.ts';
import oldPools from '../../../data/optimism/oldVelodromeStableLpPools.json' with { type: 'json' };
import newPools from '../../../data/optimism/velodromeStableLpPools.json' with { type: 'json' };

const pools = [...oldPools, ...newPools];
const getVelodromeStablePrices = async (tokenPrices: PricesById) => {
  return await getSolidlyStablePrices(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

export default getVelodromeStablePrices;
