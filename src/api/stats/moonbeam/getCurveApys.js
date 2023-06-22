import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveBaseApysOld } from '../common/curve/getCurveApyData';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { MOONBEAM_CHAIN_ID } from '../../../constants';

const pools = require('../../../data/moonbeam/curvePools.json').filter(p => p.gauge && !p.convex);
// const baseApyUrl = 'https://stats.curve.fi/raw-stats-moonbeam/apys.json';
const baseApyUrl = '';
const factoryApyUrl = 'https://api.curve.fi/api/getFactoryAPYs-moonbeam';
const tradingFees = 0.0002;

export const getCurveApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveBaseApysOld(pools, baseApyUrl, factoryApyUrl),
    getCurveApysCommon(MOONBEAM_CHAIN_ID, pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
