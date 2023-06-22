import {
  getCurveBaseApysOld,
  getTotalStakedInUsd,
  getYearlyRewardsInUsd,
} from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import { ONE_CHAIN_ID } from '../../../constants';

const pools = require('../../../data/one/curvePools.json');
const baseApyUrl = 'https://stats.curve.fi/raw-stats-harmony/apys.json';
const tradingFees = 0.0002;

const getCurveApys = async () => {
  const baseApys = await getCurveBaseApysOld(pools, baseApyUrl);
  const farmApys = await getPoolApys(pools);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};

const getPoolApys = async pools => {
  const apys = [];

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);
  values.forEach(item => apys.push(item));

  return apys;
};

const getPoolApy = async pool => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(ONE_CHAIN_ID, pool),
    getTotalStakedInUsd(ONE_CHAIN_ID, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  // console.log(pool.name, simpleApy.toNumber(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return simpleApy;
};

module.exports = getCurveApys;
