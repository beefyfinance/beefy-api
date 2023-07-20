import { getCurveBaseApys } from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { getConvexApyData } from '../common/curve/getConvexApyData';

const pools = require('../../../data/arbitrum/curvePools.json').filter(p => p.convex);
const baseApyUrl = 'https://api.curve.fi/api/getSubgraphData/arbitrum';
const tradingFees = 0.0002;

export const getConvexApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveBaseApys(pools, baseApyUrl),
    getConvexApyData(chainId, pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
