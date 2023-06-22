import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveBaseApys } from '../common/curve/getCurveApyData';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { OPTIMISM_CHAIN_ID } from '../../../constants';

const pools = require('../../../data/optimism/curvePools.json').filter(p => p.gauge && !p.convex);
const baseApyUrl = 'https://api.curve.fi/api/getSubgraphData/optimism';
const tradingFees = 0.0002;

export const getCurveApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveBaseApys(pools, baseApyUrl),
    getCurveApysCommon(OPTIMISM_CHAIN_ID, pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
