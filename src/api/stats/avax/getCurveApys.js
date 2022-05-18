import { MultiCall } from 'eth-multicall';

const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');

import fetchPrice from '../../../utils/fetchPrice';
import getApyBreakdown from '../common/getApyBreakdown';
import {
  getCurveBaseApys,
  getTotalStakedInUsd,
  getYearlyRewardsInUsd,
} from '../common/curve/getCurveApyData';
import { getContractWithProvider } from '../../../utils/contractHelper';
import { multicallAddress } from '../../../utils/web3';
import { AVAX_CHAIN_ID } from '../../../constants';

const ICurvePool = require('../../../abis/ICurvePool.json');
const { getAavePoolData } = require('./getAaveApys');

const aavePools = require('../../../data/avax/aavePools.json');
const pools = require('../../../data/avax/curvePools.json');

const baseApyUrl = 'https://api.curve.fi/api/getSubgraphData/avalanche';
// const baseApyUrl = 'https://stats.curve.fi/raw-stats-avalanche/apys.json';
// const factoryApyUrl = 'https://api.curve.fi/api/getFactoryAPYs-avalanche';
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
  if (pool.status === 'eol') return new BigNumber(0);
  const [yearlyRewardsInUsd, totalStakedInUsd, aaveMaticApy] = await Promise.all([
    getYearlyRewardsInUsd(web3, new MultiCall(web3, multicallAddress(AVAX_CHAIN_ID)), pool),
    getTotalStakedInUsd(web3, pool),
    getAaveApy(pool),
  ]);
  const rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const simpleApy = rewardsApy.plus(aaveMaticApy);
  // console.log(pool.name, aaveMaticApy.toNumber(), rewardsApy.toNumber(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return simpleApy;
};

const getAaveApy = async pool => {
  if (!pool.tokens) return new BigNumber(0);
  let promises = [];
  pool.tokens.forEach(token => promises.push(getAaveRewardApy(token)));
  pool.tokens.forEach((token, i) => promises.push(getTokenBalance(pool.pool, token, i)));
  const results = await Promise.all(promises);

  let totalBalances = new BigNumber(0);
  for (let i = pool.tokens.length; i < 2 * pool.tokens.length; i++) {
    totalBalances = totalBalances.plus(results[i]);
  }

  let totalApy = new BigNumber(0);
  for (let i = 0; i < pool.tokens.length; i++) {
    const aaveApy = results[i];
    const balance = results[i + pool.tokens.length];
    totalApy = totalApy.plus(aaveApy.times(balance).dividedBy(totalBalances));
  }

  return totalApy;
};

const getAaveRewardApy = async token => {
  if (token.basePool) {
    const pool = pools.find(p => p.name === token.basePool);
    return getAaveApy(pool);
  }

  if (!token.aaveId) return new BigNumber(0);

  const aavePool = aavePools.find(p => p.name === token.aaveId);
  const { supplyNative } = await getAavePoolData(aavePool);
  return supplyNative;
};

const getTokenBalance = async (curvePool, token, index) => {
  const pool = getContractWithProvider(ICurvePool, curvePool, web3);
  const balance = await pool.methods.balances(index).call();
  let price = 1;
  if (token.oracleId) {
    price = await fetchPrice({ oracle: token.oracle, id: token.oracleId });
  }
  return new BigNumber(balance).times(price).dividedBy(token.decimals);
};

module.exports = getCurveApys;
