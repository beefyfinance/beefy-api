import { MONAD_CHAIN_ID as chainId } from '../../../constants.ts';
import getEulerApyData from '../common/euler/getEulerApys.ts';
import type { EulerApyParams, EulerPool } from '../common/euler/getEulerApys.ts';
import eulerPoolsData from '../../../data/monad/eulerPools.json' with { type: "json" };

const pools: EulerPool[] = eulerPoolsData.filter(p => !p.eol);
const params: EulerApyParams = {
  chainId,
  pools,
  // log: true,
};

export const getEulerApys = async () => {
  return getEulerApyData(params);
};

export default getEulerApys;
