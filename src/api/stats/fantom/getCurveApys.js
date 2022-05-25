import { MultiCall } from 'eth-multicall';

const { fantomWeb3: web3 } = require('../../../utils/web3');
const fetch = require('node-fetch');

import {
  getCurveBaseApys,
  getTotalStakedInUsd,
  getYearlyRewardsInUsd,
} from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import ICurvePool from '../../../abis/ICurvePool.json';
import fetchPrice from '../../../utils/fetchPrice';
import BigNumber from 'bignumber.js';
import { getContractWithProvider } from '../../../utils/contractHelper';
import { multicallAddress } from '../../../utils/web3';
import { FANTOM_CHAIN_ID } from '../../../constants';

const pools = require('../../../data/fantom/curvePools.json');
const baseApyUrl = 'https://api.curve.fi/api/getSubgraphData/fantom';
// const baseApyUrl = 'https://stats.curve.fi/raw-stats-ftm/apys.json';
// const factoryApyUrl = 'https://api.curve.fi/api/getFactoryAPYs-fantom';
const tradingFees = 0.0002;
let geistRewardApys = {};

const getCurveApys = async () => {
  const [baseApys, geistApys] = await Promise.all([
    getCurveBaseApys(pools, baseApyUrl),
    getGeistApys(),
  ]);
  geistRewardApys = geistApys;
  const farmApys = await getPoolApys(pools);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};

const getGeistApys = async () => {
  let apys = {};
  try {
    const response = await fetch('https://api.geist.finance/api/lendingPoolRewards').then(res =>
      res.json()
    );
    const apyData = response.data.poolAPRs;
    apyData.forEach(apy => {
      apys = { ...apys, ...{ [apy.tokenAddress]: apy.apy / 2 } }; // 50% penalty fee
    });
  } catch (err) {
    console.error(err);
  }
  return apys;
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
  const [yearlyRewardsInUsd, totalStakedInUsd, geistApy] = await Promise.all([
    getYearlyRewardsInUsd(web3, new MultiCall(web3, multicallAddress(FANTOM_CHAIN_ID)), pool),
    getTotalStakedInUsd(web3, pool),
    getGeistPoolApy(pool),
  ]);
  const rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const simpleApy = rewardsApy.plus(geistApy);
  // console.log(pool.name,geistApy.toNumber(),rewardsApy.toNumber(),totalStakedInUsd.valueOf(),yearlyRewardsInUsd.valueOf());
  return simpleApy;
};

const getGeistPoolApy = async pool => {
  if (!pool.tokens) return new BigNumber(0);
  if (!pool.tokens.find(t => t.geistToken !== undefined)) return new BigNumber(0);

  let promises = [];
  pool.tokens.forEach((token, i) => promises.push(getTokenBalance(pool.pool, token, i)));
  const results = await Promise.all(promises);

  let totalBalances = new BigNumber(0);
  results.forEach(r => (totalBalances = totalBalances.plus(r)));

  let totalApy = new BigNumber(0);
  for (let i = 0; i < pool.tokens.length; i++) {
    const geistApy = new BigNumber(geistRewardApys[pool.tokens[i].geistToken] || 0);
    const balance = results[i];
    totalApy = totalApy.plus(geistApy.times(balance).dividedBy(totalBalances));
  }

  return totalApy;
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
