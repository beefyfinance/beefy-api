import type { BigNumber } from 'bignumber.js';
import { MONAD_CHAIN_ID as chainId } from '../../../constants.ts';
import { getMerklApys } from '../common/curve/getCurveApysCommon.ts';
import { getApyBreakdown } from '../common/getApyBreakdownNew.ts';
import curvePoolsData from '../../../data/monad/curvePools.json' with { type: 'json' };

const pools = curvePoolsData.filter(p => p.gauge);

export const getCurveApys = async () => {
  const [baseApys, curveApys]: [Record<string, BigNumber>, BigNumber[]] = await Promise.all([
    {},
    getMerklApys(chainId, pools),
  ]);

  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, vault: curveApys[i], trading: baseApys[p.name] })));
};
