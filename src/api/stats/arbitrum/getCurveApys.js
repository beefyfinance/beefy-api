import { getApyBreakdown } from '../common/getApyBreakdownNew';
import { getCurveSubgraphApys } from '../common/curve/getCurveApyData';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { getStakeDaoV2Apys } from '../common/curve/getStakeDaoV2Apys';
import { getConvexApyData } from '../common/curve/getConvexApyData';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';

const pools = require('../../../data/arbitrum/curvePools.json').filter(p => p.gauge);
const baseApyUrl = 'https://api.curve.finance/api/getSubgraphData/arbitrum';

export const getCurveApys = async () => {
  const curvePools = pools.filter(p => !p.convex);
  const convexPools = pools.filter(p => p.convex);

  const [baseApys, curveApys, convexApys, stakeDaoApys] = await Promise.all([
    await getCurveSubgraphApys(pools, baseApyUrl),
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
