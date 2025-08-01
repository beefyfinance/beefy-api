import { getApyBreakdown } from '../common/getApyBreakdownNew';
import { getCurveGetBaseApys, getCurveSubgraphApys } from '../common/curve/getCurveApyData';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { getConvexApyData } from '../common/curve/getConvexApyData';
import { getStakeDaoV2Apys } from '../common/curve/getStakeDaoV2Apys';
import { FRAXTAL_CHAIN_ID as chainId } from '../../../constants';

const pools = require('../../../data/fraxtal/curvePools.json').filter(p => p.gauge);
const subgraphApyUrl = 'https://api.curve.finance/api/getSubgraphData/fraxtal';
const baseApyUrl = 'https://api.curve.finance/v1/getBaseApys/fraxtal';

export const getCurveApys = async () => {
  const curvePools = pools.filter(p => !p.convex);
  const convexPools = pools.filter(p => p.convex);

  const [baseApys, curveApys, convexApys, stakeDaoApys] = await Promise.all([
    getCurveGetBaseApys(pools, baseApyUrl),
    getCurveApysCommon(chainId, curvePools),
    getConvexApyData(chainId, convexPools),
    getStakeDaoV2Apys(chainId, convexPools),
  ]);

  return getApyBreakdown([
    ...curvePools.map((p, i) => ({ vaultId: p.name, vault: curveApys[i], trading: baseApys[p.name] })),
    ...convexPools.map((p, i) => ({ vaultId: p.name, vault: convexApys[i], trading: baseApys[p.name] })),
    ...convexPools.map((p, i) => ({
      vaultId: p.name.replace('curve-', 'stakedao-'),
      vault: stakeDaoApys[i],
      trading: baseApys[p.name],
    })),
  ]);
};
