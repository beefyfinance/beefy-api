import { PLASMA_CHAIN_ID as chainId } from '../../../constants.ts';
import { getMerklApys } from '../common/curve/getCurveApysCommon.js';
import { getApyBreakdown } from '../common/getApyBreakdownNew.ts';
import curvePoolsData from '../../../data/plasma/curvePools.json' with { type: 'json' };

const pools = curvePoolsData.filter(p => p.gauge);
const subgraphApyUrl = 'https://api.curve.finance/api/getSubgraphData/plasma';

export const getCurveApys = async () => {
  const [baseApys, curveApys] = await Promise.all([
    // getCurveSubgraphApys(pools, subgraphApyUrl),
    {},
    getMerklApys(chainId, pools),
  ]);

  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, vault: curveApys[i], trading: baseApys[p.name] })));
};
