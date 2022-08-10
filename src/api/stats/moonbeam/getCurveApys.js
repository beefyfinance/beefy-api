import { MultiCall } from 'eth-multicall';

import { moonbeamWeb3 as web3, multicallAddress } from '../../../utils/web3';
import { MOONBEAM_CHAIN_ID as chainId } from '../../../constants';

import {
  getCurveBaseApys,
  getCurveBaseApysOld,
  getTotalStakedInUsd,
  getYearlyRewardsInUsd,
} from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';

const pools = require('../../../data/moonbeam/curvePools.json');
// const subgraphUrl = 'https://api.curve.fi/api/getSubgraphData/optimism';
const baseApyUrl = 'https://stats.curve.fi/raw-stats-moonbeam/apys.json';
const factoryApyUrl = 'https://api.curve.fi/api/getFactoryAPYs-moonbeam';
const tradingFees = 0.0002;

export const getCurveApys = async () => {
  // const baseApys = await getCurveBaseApys(pools, subgraphUrl);
  const baseApys = await getCurveBaseApysOld(pools, baseApyUrl, factoryApyUrl);
  const farmApys = await getPoolApys(pools);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name, beefyFee: p.beefyFee }));
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
    getYearlyRewardsInUsd(web3, new MultiCall(web3, multicallAddress(chainId)), pool),
    getTotalStakedInUsd(web3, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  // console.log(pool.name, simpleApy.toNumber(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return simpleApy;
};
