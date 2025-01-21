import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { getCurveLendSupplyApys } from '../common/curve/getCurveLendSupplyApys';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';

const pools = require('../../../data/arbitrum/curveLendPools.json');

export const getCurveLendApys = async () => {
  const curvePools = pools.filter(p => !p.convex);
  if (curvePools.length === 0) return {};

  const [baseApys, curveApys, convexApys] = await Promise.all([
    getCurveLendSupplyApys(chainId, pools),
    getCurveApysCommon(chainId, curvePools),
    [],
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, [...curveApys, ...convexApys]);
};
