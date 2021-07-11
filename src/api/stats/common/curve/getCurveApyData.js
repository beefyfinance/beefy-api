const axios = require('axios');
const BigNumber = require('bignumber.js');

const fetchPrice = require('../../../../utils/fetchPrice');

const IRewardGauge = require('../../../../abis/IRewardPool.json');
const IRewardStream = require('../../../../abis/ICurveRewardStream.json');
const ICurveRewards = require('../../../../abis/ICurveRewards.json');

const secondsPerYear = 31536000;

const getCurveBaseApys = async (pools, url) => {
  let apys = {};
  try {
    const response = await axios.get(url);
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

const getTotalStakedInUsd = async (web3, pool) => {
  const gauge = new web3.eth.Contract(IRewardGauge, pool.gauge);
  const totalSupply = new BigNumber(await gauge.methods.totalSupply().call());
  const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return totalSupply.multipliedBy(lpPrice).dividedBy('1e18');
};

const getYearlyRewardsInUsd = async (web3, pool) => {
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

    const price = await fetchPrice({ oracle: rewards.oracle ?? 'tokens', id: rewards.oracleId });
    const rewardsInUsd = rewardRate
      .times(secondsPerYear)
      .times(price)
      .dividedBy(rewards.decimals ?? '1e18');
    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(rewardsInUsd);
  }

  return yearlyRewardsInUsd;
};

module.exports = { getCurveBaseApys, getTotalStakedInUsd, getYearlyRewardsInUsd };
