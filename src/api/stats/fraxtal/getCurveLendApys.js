import { getApyBreakdown } from '../common/getApyBreakdownNew';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { getConvexApyData } from '../common/curve/getConvexApyData';
import { getCurveLendSupplyApys } from '../common/curve/getCurveLendSupplyApys';
import { getStakeDaoV2Apys } from '../common/curve/getStakeDaoV2Apys';
import { FRAXTAL_CHAIN_ID as chainId } from '../../../constants';

const pools = require('../../../data/fraxtal/curveLendPools.json');

export const getCurveLendApys = async () => {
  const curvePools = pools.filter(p => !p.convex);
  const convexPools = pools.filter(p => p.convex);

  const [baseApys, curveApys, convexApys, stakeDaoApys] = await Promise.all([
    await getCurveLendSupplyApys(chainId, pools),
    await getCurveApysCommon(chainId, curvePools),
    await getConvexApyData(chainId, convexPools),
    await getStakeDaoV2Apys(chainId, pools),
  ]);
  return getApyBreakdown([
    ...curvePools.map((p, i) => ({ vaultId: p.name, vault: curveApys[i], trading: baseApys[p.name] })),
    ...convexPools.map((p, i) => ({ vaultId: p.name, vault: convexApys[i], trading: baseApys[p.name] })),
    ...pools.map((p, i) => ({
      vaultId: p.name.replace('curve-lend-', 'stakedao-lend-'),
      vault: stakeDaoApys[i],
      trading: baseApys[p.name],
    })),
  ]);
};
