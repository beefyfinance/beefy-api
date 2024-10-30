import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { getConvexApyData } from '../common/curve/getConvexApyData';
import { getCurveLendSupplyApys } from '../common/curve/getCurveLendSupplyApys';
import { FRAXTAL_CHAIN_ID as chainId } from '../../../constants';

const pools = require('../../../data/fraxtal/curveLendPools.json');

export const getCurveLendApys = async () => {
  const curvePools = pools.filter(p => !p.convex);
  const convexPools = pools.filter(p => p.convex);

  const [baseApys, curveApys, convexApys] = await Promise.all([
    await getCurveLendSupplyApys(chainId, pools),
    await getCurveApysCommon(chainId, curvePools),
    await getConvexApyData(chainId, convexPools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, [...curveApys, ...convexApys]);
};
