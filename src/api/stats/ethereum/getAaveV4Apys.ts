import { ETH_CHAIN_ID } from '../../../constants';
import { getAaveV4ApyData } from '../common/aave/getAaveV4Apys';
import type { AaveV4Pool } from '../common/aave/getAaveV4Apys';

const pools: AaveV4Pool[] = require('../../../data/ethereum/aaveV4Pools.json');

export const getAaveV4Apys = async () => {
  return getAaveV4ApyData(ETH_CHAIN_ID, pools);
};
