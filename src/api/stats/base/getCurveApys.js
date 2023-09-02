import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveBaseApysOld } from '../common/curve/getCurveApyData';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { BASE_CHAIN_ID as chainId } from '../../../constants';

const pools = require('../../../data/base/curvePools.json').filter(p => p.gauge && !p.convex);
const factoryApyUrl = 'https://api.curve.fi/api/getFactoryAPYs-base';
const tradingFees = 0.0002;

export const getCurveApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveBaseApysOld(pools, false, factoryApyUrl),
    getCurveApysCommon(chainId, pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
