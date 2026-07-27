import { POLYGON_CHAIN_ID } from '../../../constants.ts';
import { getCurveSubgraphApys } from '../common/curve/getCurveApyData.js';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon.js';
import { getApyBreakdown } from '../common/getApyBreakdown.ts';
import curvePoolsData from '../../../data/matic/curvePools.json' with { type: 'json' };

const pools = curvePoolsData.filter(p => p.gauge && !p.convex);
const baseApyUrl = 'https://api.curve.finance/api/getSubgraphData/polygon';
const tradingFees = 0.00015;

export const getCurveApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveSubgraphApys(pools, baseApyUrl),
    getCurveApysCommon(POLYGON_CHAIN_ID, pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
