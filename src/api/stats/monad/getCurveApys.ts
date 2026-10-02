import type { BigNumber } from 'bignumber.js';
import { ApiChainId } from '../../../utils/chain.ts';
import { getMerklApys } from '../common/curve/getCurveApysCommon.ts';
import { getApyBreakdown } from '../common/getApyBreakdownNew.ts';
import curvePoolsData from '../../../data/monad/curvePools.json' with { type: 'json' };

const pools = curvePoolsData.filter(p => p.gauge);

export const getCurveApys = async () => {
  const [baseApys, curveApys]: [Record<string, BigNumber>, BigNumber[]] = await Promise.all([
    {},
    getMerklApys(ApiChainId.monad, pools),
  ]);

  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, vault: curveApys[i], trading: baseApys[p.name] })));
};
