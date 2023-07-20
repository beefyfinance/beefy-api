import { getCurveBaseApys } from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import { POLYGON_CHAIN_ID } from '../../../constants';
import { getConvexApyData } from '../common/curve/getConvexApyData';

const pools = require('../../../data/matic/curvePools.json').filter(p => p.convex);
const baseApyUrl = 'https://api.curve.fi/api/getSubgraphData/polygon';
const tradingFees = 0.0002;

export const getConvexApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveBaseApys(pools, baseApyUrl),
    getConvexApyData(POLYGON_CHAIN_ID, pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
