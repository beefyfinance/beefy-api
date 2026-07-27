import { SCROLL_CHAIN_ID as chainId } from '../../../constants.ts';
import type { CompoundV3ApyParams, CompoundV3Pool } from '../common/getCompoundV3Apys.ts';
import getCompoundV3ApyData from '../common/getCompoundV3Apys.ts';
import compoundPoolsData from '../../../data/scroll/compoundPools.json' with { type: 'json' };

const pools: CompoundV3Pool[] = compoundPoolsData;
const params: CompoundV3ApyParams = {
  chainId,
  pools,
  compOracleId: 'COMP',
  secondsPerBlock: 1, // Sonne reports rates per second, not pet block
  //log: true,
};

const getScrollCompoundV3Apys = async () => {
  return getCompoundV3ApyData(params);
};

export { getScrollCompoundV3Apys };
