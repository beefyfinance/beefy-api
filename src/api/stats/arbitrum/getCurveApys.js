import { MultiCall } from 'eth-multicall';

const { arbitrumWeb3: web3 } = require('../../../utils/web3');

import {
  getCurveBaseApys,
  getTotalStakedInUsd,
  getYearlyRewardsInUsd,
} from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import { multicallAddress } from '../../../utils/web3';
import { ARBITRUM_CHAIN_ID } from '../../../constants';

const pools = require('../../../data/arbitrum/curvePools.json');
const baseApyUrl = 'https://api.curve.fi/api/getSubgraphData/arbitrum';
// const baseApyUrl = 'https://stats.curve.fi/raw-stats-arbitrum/apys.json';
// const factoryApyUrl = 'https://api.curve.fi/api/getFactoryAPYs-arbitrum';
const tradingFees = 0.0002;

const getCurveApys = async () => {
  const baseApys = await getCurveBaseApys(pools, baseApyUrl);
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
    getYearlyRewardsInUsd(web3, new MultiCall(web3, multicallAddress(ARBITRUM_CHAIN_ID)), pool),
    getTotalStakedInUsd(web3, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  // console.log(pool.name, simpleApy.toNumber(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return simpleApy;
};

module.exports = { getCurveApys };
