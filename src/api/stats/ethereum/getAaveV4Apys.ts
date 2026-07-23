import { ETH_CHAIN_ID } from '../../../constants.ts';
import type { AaveV4Pool } from '../common/aave/getAaveV4Apys.ts';
import { getAaveV4ApyData } from '../common/aave/getAaveV4Apys.ts';
import aaveV4PoolsData from '../../../data/ethereum/aaveV4Pools.json' with { type: 'json' };

const pools: AaveV4Pool[] = aaveV4PoolsData;

export const getAaveV4Apys = async () => {
  return getAaveV4ApyData(ETH_CHAIN_ID, pools);
};
