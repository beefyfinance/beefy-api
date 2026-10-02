import { ApiChainId } from '../../../utils/chain.ts';
import type { EulerApyParams, EulerPool } from '../common/euler/getEulerApys.ts';
import getEulerApyData from '../common/euler/getEulerApys.ts';
import eulerPoolsData from '../../../data/monad/eulerPools.json' with { type: 'json' };

const pools: EulerPool[] = eulerPoolsData.filter(p => !p.eol);
const params: EulerApyParams = {
  chainId: ApiChainId.monad,
  pools,
  // log: true,
};

export const getEulerApys = async () => {
  return getEulerApyData(params);
};

export default getEulerApys;
