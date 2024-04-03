import { getCurveGetBaseApys } from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import { FRAXTAL_CHAIN_ID as chainId } from '../../../constants';
import { getConvexApyData } from '../common/curve/getConvexApyData';

const pools = require('../../../data/fraxtal/curvePools.json').filter(p => p.convex);
const baseApyUrl = 'https://api.curve.fi/v1/getBaseApys/fraxtal';
const tradingFees = 0.0002;

export const getConvexApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveGetBaseApys(pools, baseApyUrl),
    getConvexApyData(chainId, pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
