import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveBaseApysOld, getCurveSubgraphApys } from '../common/curve/getCurveApyData';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { BASE_CHAIN_ID as chainId } from '../../../constants';

const pools = require('../../../data/base/curvePools.json').filter(p => p.gauge && !p.convex);
const subgraphApyUrl = 'https://api.curve.finance/api/getSubgraphData/base';
const tradingFees = 0.0002;

export const getCurveApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveSubgraphApys(pools, subgraphApyUrl),
    getCurveApysCommon(chainId, pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
