import { getApyBreakdown } from '../common/getApyBreakdownNew.ts';
import { getCurveVolumeApys } from '../common/curve/getCurveApyData.js';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon.js';
import { getConvexApyData } from '../common/curve/getConvexApyData.js';
import { FRAXTAL_CHAIN_ID as chainId } from '../../../constants.ts';
import curvePoolsData from '../../../data/fraxtal/curvePools.json' with { type: "json" };

const pools = curvePoolsData.filter(p => p.gauge);
const baseApyUrl = 'https://api.curve.finance/api/getVolumes/fraxtal';

export const getCurveApys = async () => {
  const curvePools = pools.filter(p => !p.convex);
  const convexPools = pools.filter(p => p.convex);

  const [baseApys, curveApys, convexApys] = await Promise.all([
    getCurveVolumeApys(pools, baseApyUrl),
    getCurveApysCommon(chainId, curvePools),
    getConvexApyData(chainId, convexPools),
  ]);

  return getApyBreakdown([
    ...curvePools.map((p, i) => ({ vaultId: p.name, vault: curveApys[i], trading: baseApys[p.name] })),
    ...convexPools.map((p, i) => ({ vaultId: p.name, vault: convexApys[i], trading: baseApys[p.name] })),
  ]);
};
