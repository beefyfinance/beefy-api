import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveGetBaseApys } from '../common/curve/getCurveApyData';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { FRAXTAL_CHAIN_ID as chainId } from '../../../constants';

const pools = require('../../../data/fraxtal/curvePools.json').filter(p => p.gauge && !p.convex);
const subgraphApyUrl = 'https://api.curve.fi/api/getSubgraphData/fraxtal';
const baseApyUrl = 'https://api.curve.fi/v1/getBaseApys/fraxtal';
const tradingFees = 0.0002;

export const getCurveApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveGetBaseApys(pools, baseApyUrl),
    getCurveApysCommon(chainId, pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
