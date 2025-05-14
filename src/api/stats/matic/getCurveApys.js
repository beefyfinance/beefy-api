import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveSubgraphApys } from '../common/curve/getCurveApyData';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { POLYGON_CHAIN_ID } from '../../../constants';

const pools = require('../../../data/matic/curvePools.json').filter(p => p.gauge && !p.convex);
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
