const BigNumber = require('bignumber.js');

const fetchPrice = require('../../../../utils/fetchPrice');
const { fetchContract } = require('../../../rpc/client');
const { default: ICurveGauge } = require('../../../../abis/ICurveGauge');
const { default: ICurveRewards } = require('../../../../abis/ICurveRewards');
const { default: ICurveRewardStream } = require('../../../../abis/ICurveRewardStream');

const secondsPerYear = 31536000;

const getCurveBaseApys = async (pools, url) => {
  let apys = {};
  try {
    const response = await fetch(url).then(res => res.json());
    const apyData = response.data.poolList;
    pools.forEach(pool => {
      let apy = new BigNumber(getSubgraphDataApy(apyData, pool.pool));
      apys = { ...apys, ...{ [pool.name]: apy } };
    });
  } catch (err) {
    console.error('Curve base apy error ', url);
  }
  return apys;
};

const getSubgraphDataApy = (apyData, poolAddress) => {
  try {
    let pool = apyData.find(p => p.address.toLowerCase() === poolAddress.toLowerCase());
    if (!pool) return 0;
    let apy = Math.max(pool.latestDailyApy, pool.latestWeeklyApy);
    return Number(apy) / 100;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

const getCurveBaseApysOld = async (pools, url, factoryUrl) => {
  let factoryApyData = [];
  if (factoryUrl) {
    try {
      const response = await fetch(factoryUrl).then(res => res.json());
      factoryApyData = response.data.poolDetails;
    } catch (e) {
      console.error('Curve factory apy error ', factoryUrl);
    }
  }

  let baseApyData;
  if (url) {
    try {
      const response = await fetch(url).then(res => res.json());
      baseApyData = response.apy;
    } catch (e) {
      console.error('Curve base apy error ', url);
    }
  }

  let apys = {};
  pools.forEach(pool => {
    let apy;
    if (pool.baseApyKey && baseApyData) {
      apy = new BigNumber(getBaseApy(baseApyData, pool));
    } else if (factoryApyData) {
      apy = new BigNumber(getFactoryApy(factoryApyData, pool.pool));
    }
    apys = { ...apys, ...{ [pool.name]: apy } };
  });
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

const getFactoryApy = (factoryApyData, poolAddress) => {
  try {
    let pool = factoryApyData.find(p => p.poolAddress.toLowerCase() === poolAddress.toLowerCase());
    return pool ? Math.max(Number(pool.apy), 0) / 100 : 0;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

// used outside of Curve farms - Spell, MAI, Jarvis
const getCurveFactoryApy = async (address, url) => {
  let apys = {};
  try {
    const response = await fetch(url).then(res => res.json());
    const pools = response.data.poolDetails;
    pools.forEach(pool => {
      if (pool.poolAddress.toLowerCase() === address.toLowerCase()) {
        const apy = new BigNumber(pool.apy).dividedBy(100);
        apys = { ...apys, ...{ [address.toLowerCase()]: apy } };
      }
    });
  } catch (err) {
    console.error(err);
  }
  return apys;
};

const getTotalStakedInUsd = async (chainId, pool) => {
  if (!pool.gauge) return new BigNumber(1);
  const gauge = fetchContract(pool.gauge, ICurveGauge, chainId);
  const totalSupply = new BigNumber((await gauge.read.totalSupply()).toString());
  const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return totalSupply.multipliedBy(lpPrice).dividedBy('1e18');
};

const getBoostedYearlyRewardsInUsd = async (chainId, pool) => {
  const crvPrice = await fetchPrice({ oracle: 'tokens', id: 'CRV' });

  // boosted CRV rewards calculated based on working_supply, not totalSupply
  // but additional rewards calculated from totalSupply
  // we return totalSupply in getTotalStaked and increase rewards here by (* totalSupply / workingSupply)
  // so total APY can be calculated as yearlyRewards / totalStaked
  const weekEpoch = Math.floor(Date.now() / 1000 / (86400 * 7));
  const gauge = fetchContract(pool.gauge, ICurveGauge, chainId);
  const calls = [
    gauge.read.inflation_rate([weekEpoch]),
    gauge.read.totalSupply(),
    gauge.read.working_supply(),
  ];
  const res = await Promise.all([calls]);
  const rewardRate = new BigNumber(res[0].toString());
  const totalSupply = new BigNumber(res[1].toString());
  const workingSupply = new BigNumber(res[2].toString());

  return rewardRate
    .times(secondsPerYear)
    .times(0.4)
    .times(crvPrice)
    .times(totalSupply)
    .div(workingSupply)
    .dividedBy('1e18');
};

const getYearlyRewardsInUsd = async (chainId, pool) => {
  let [yearRewardsInUsd, ratesAndPeriods] = await Promise.all([
    pool.boosted
      ? getBoostedYearlyRewardsInUsd(chainId, pool)
      : new Promise(resolve => resolve(new BigNumber(0))),
    getPoolsRatesAndPeriodFinish(chainId, pool),
  ]);

  const { rewardRates, periodsFinish } = ratesAndPeriods;

  for (const [index, rewards] of Object.entries(pool.rewards ?? [])) {
    const rewardRate = rewardRates[index];
    const periodFinish = periodsFinish[index];

    if (periodFinish < Date.now() / 1000) {
      continue;
    }

    const price = await fetchPrice({ oracle: rewards.oracle ?? 'tokens', id: rewards.oracleId });
    const rewardsInUsd = rewardRate
      .times(secondsPerYear)
      .times(price)
      .dividedBy(rewards.decimals ?? '1e18');
    yearRewardsInUsd = yearRewardsInUsd.plus(rewardsInUsd);
  }

  return yearRewardsInUsd;
};

const getPoolsRatesAndPeriodFinish = async (chainId, pool) => {
  const periodFinishCalls = [];
  const rewardRateCalls = [];
  (pool.rewards ?? []).forEach(rewards => {
    if (pool.boosted || rewards.rewardToken) {
      const token = rewards.rewardToken ? rewards.rewardToken : rewards.token;
      const rewardStream = fetchContract(pool.gauge, ICurveGauge, chainId);
      const call = rewardStream.read.reward_data([token]);

      periodFinishCalls.push(call.then(res => res[1]));
      rewardRateCalls.push(call.then(res => res[2]));
    } else if (rewards.newGauge) {
      const rewardStream = fetchContract(rewards.stream, ICurveGauge, chainId);
      const weekEpoch = Math.floor(Date.now() / 1000 / (86400 * 7));
      const periodFinish = (weekEpoch + 1) * (86400 * 7) + 86400;

      periodFinishCalls.push(new Promise(resolve => resolve(periodFinish)));
      rewardRateCalls.push(rewardStream.read.inflation_rate([weekEpoch]));
    } else if (rewards.token) {
      const rewardStream = fetchContract(rewards.stream, ICurveRewards, chainId);
      const call = rewardStream.read.reward_data([rewards.token]);

      periodFinishCalls.push(call.then(res => res[1]));
      rewardRateCalls.push(call.then(res => res[2]));
    } else {
      const rewardStream = fetchContract(rewards.stream, ICurveRewardStream, chainId);

      periodFinishCalls.push(rewardStream.read.period_finish());
      rewardRateCalls.push(rewardStream.read.reward_rate());
    }
  });

  const res = await Promise.all([Promise.all(periodFinishCalls), Promise.all(rewardRateCalls)]);
  return {
    periodsFinish: res[0].map(v => Number(v)),
    rewardRates: res[1].map(v => new BigNumber(v.toString())),
  };
};

module.exports = {
  getCurveBaseApys,
  getCurveBaseApysOld,
  getCurveFactoryApy,
  getTotalStakedInUsd,
  getYearlyRewardsInUsd,
};
