const axios = require('axios');
const BigNumber = require('bignumber.js');
const { polygonWeb3: web3 } = require('../../../utils/web3');

const ICurvePool = require('../../../abis/ICurvePool.json');
const IRewardGauge = require('../../../abis/IRewardPool.json');
const IRewardStream = require('../../../abis/ICurveRewardStream.json');
const ICurveRewards = require('../../../abis/ICurveRewards.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { getAavePoolData } = require('./getAaveApys');
import getApyBreakdown from '../common/getApyBreakdown';

const aavePools = require('../../../data/matic/aavePools.json');
const pools = require('../../../data/matic/curvePools.json');

const curvePool = '0x445FE580eF8d70FF569aB36e80c647af338db351';

const secondsPerYear = 31536000;
const tradingFees = 0.00015;

const tokens = [
  { i: 0, aaveId: 'aave-dai', decimals: '1e18' },
  { i: 1, aaveId: 'aave-usdc', decimals: '1e6' },
  { i: 2, aaveId: 'aave-usdt', decimals: '1e6' },
];

const getCurveApys = async () => {
  const baseApys = await getBaseApys(pools);
  const farmApys = await getPoolApys(pools);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};

const getBaseApys = async pools => {
  let apys = {};
  try {
    const response = await axios.get('https://stats.curve.fi/raw-stats-polygon/apys.json');
    const apyData = response.data.apy;
    pools.forEach(pool => {
      const apy = new BigNumber(getBaseApy(apyData, pool));
      apys = { ...apys, ...{ [pool.name]: apy } };
    });
  } catch (err) {
    console.error(err);
  }
  return apys;
};

const getBaseApy = (baseApyData, pool) => {
  try {
    return Math.max(
      baseApyData.day[pool.baseApyKey],
      baseApyData.week[pool.baseApyKey],
      baseApyData.month[pool.baseApyKey],
      baseApyData.total[pool.baseApyKey]
    );
  } catch (err) {
    console.error(err);
    return 0;
  }
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
    getYearlyRewardsInUsd(pool),
    getTotalStakedInUsd(pool),
  ]);
  const rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const aaveMaticApy = await getAaveMaticApy();
  const simpleApy = rewardsApy.plus(aaveMaticApy);
  // console.log(pool.name, aaveMaticApy.toNumber(), rewardsApy.toNumber(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return simpleApy;
};

const getTotalStakedInUsd = async pool => {
  const gauge = new web3.eth.Contract(IRewardGauge, pool.gauge);
  const totalSupply = new BigNumber(await gauge.methods.totalSupply().call());
  const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return totalSupply.multipliedBy(lpPrice).dividedBy('1e18');
};

const getYearlyRewardsInUsd = async pool => {
  let yearlyRewardsInUsd = new BigNumber(0);

  for (const rewards of pool.rewards) {
    let periodFinish, rewardRate;
    if (rewards.token) {
      const rewardStream = new web3.eth.Contract(ICurveRewards, rewards.stream);
      let { period_finish, rate } = await rewardStream.methods.reward_data(rewards.token).call();
      periodFinish = Number(period_finish);
      rewardRate = new BigNumber(rate);
    } else {
      const rewardStream = new web3.eth.Contract(IRewardStream, rewards.stream);
      periodFinish = Number(await rewardStream.methods.period_finish().call());
      rewardRate = new BigNumber(await rewardStream.methods.reward_rate().call());
    }

    if (periodFinish < Date.now() / 1000) {
      continue;
    }

    const price = await fetchPrice({ oracle: rewards.oracle, id: rewards.oracleId });
    const rewardsInUsd = rewardRate.times(secondsPerYear).times(price).dividedBy(rewards.decimals);
    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(rewardsInUsd);
  }

  return yearlyRewardsInUsd;
};

const getAaveMaticApy = async () => {
  const curveAaveIds = tokens.map(({ aaveId }) => aaveId);
  const curveAavePools = aavePools.filter(p => curveAaveIds.includes(p.name));

  let promises = [];
  curveAavePools.forEach(pool => promises.push(getAavePoolData(pool)));
  const aaveApys = await Promise.all(promises);

  promises = [];
  tokens.forEach(token => promises.push(getTokenBalance(curvePool, token)));
  const balances = await Promise.all(promises);

  let totalBalances = new BigNumber(0);
  balances.forEach(b => (totalBalances = totalBalances.plus(b)));

  let totalApy = new BigNumber(0);
  tokens.forEach(({ aaveId }, i) => {
    const aaveApy = aaveApys[i].supplyMatic;
    const balance = balances[i];
    totalApy = totalApy.plus(aaveApy.times(balance).dividedBy(totalBalances));
  });

  return totalApy;
};

const getTokenBalance = async (curvePool, token) => {
  const pool = new web3.eth.Contract(ICurvePool, curvePool);
  const balance = await pool.methods.balances(token.i).call();
  return new BigNumber(balance).dividedBy(token.decimals);
};

module.exports = getCurveApys;
