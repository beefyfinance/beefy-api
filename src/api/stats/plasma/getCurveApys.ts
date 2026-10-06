import type { BigNumber } from 'bignumber.js';
import { ApiChainId } from '../../../utils/chain.ts';
import { getMerklApys } from '../common/curve/getCurveApysCommon.ts';
import { getApyBreakdown } from '../common/getApyBreakdownNew.ts';
import curvePoolsData from '../../../data/plasma/curvePools.json' with { type: 'json' };

const pools = curvePoolsData.filter(p => p.gauge);
const subgraphApyUrl = 'https://api.curve.finance/api/getSubgraphData/plasma';

export const getCurveApys = async () => {
  // FIXME(unsafe-cast): unsafe narrow
  const [baseApys, curveApys] = await Promise.all([
    // getCurveSubgraphApys(pools, subgraphApyUrl),
    {} as Record<string, BigNumber>,
    getMerklApys(ApiChainId.plasma, pools),
  ]);

  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, vault: curveApys[i], trading: baseApys[p.name] })));
};
