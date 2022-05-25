const fetch = require('node-fetch');
const BigNumber = require('bignumber.js');

const fetchPrice = require('../../../../utils/fetchPrice');

const ICurveGauge = require('../../../../abis/ICurveGauge.json');
const IRewardStream = require('../../../../abis/ICurveRewardStream.json');
const ICurveRewards = require('../../../../abis/ICurveRewards.json');
const { getContractWithProvider, getContract } = require('../../../../utils/contractHelper');

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
    console.error('Curve base apy error ', url, err);
  }
  return apys;
};

const getSubgraphDataApy = (apyData, poolAddress) => {
  try {
    let pool = apyData.find(p => p.address.toLowerCase() === poolAddress.toLowerCase());
    if (!pool) return 0;
    pool ? Number(pool.apy) / 100 : 0;
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
      console.error('Curve factory apy error ', factoryUrl, e);
    }
  }

  let apys = {};
  try {
    const response = await fetch(url).then(res => res.json());
    const apyData = response.apy;
    pools.forEach(pool => {
      let apy;
      if (pool.baseApyKey) {
        apy = new BigNumber(getBaseApy(apyData, pool));
      } else {
        apy = new BigNumber(getFactoryApy(factoryApyData, pool.pool));
      }
      apys = { ...apys, ...{ [pool.name]: apy } };
    });
  } catch (err) {
    console.error('Curve base apy error ', url, err);
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

const getFactoryApy = (factoryApyData, poolAddress) => {
  try {
    let pool = factoryApyData.find(p => p.poolAddress.toLowerCase() === poolAddress.toLowerCase());
    return pool ? Number(pool.apy) / 100 : 0;
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

const getTotalStakedInUsd = async (web3, pool) => {
  if (!pool.gauge) return new BigNumber(1);
  const gauge = getContractWithProvider(ICurveGauge, pool.gauge, web3);
  const totalSupply = new BigNumber(await gauge.methods.totalSupply().call());
  const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return totalSupply.multipliedBy(lpPrice).dividedBy('1e18');
};

const getBoostedYearlyRewardsInUsd = async (web3, multicall, pool) => {
  const crvPrice = await fetchPrice({ oracle: 'tokens', id: 'CRV' });

  // boosted CRV rewards calculated based on working_supply, not totalSupply
  // but additional rewards calculated from totalSupply
  // we return totalSupply in getTotalStaked and increase rewards here by (* totalSupply / workingSupply)
  // so total APY can be calculated as yearlyRewards / totalStaked
  const weekEpoch = Math.floor(Date.now() / 1000 / (86400 * 7));
  const gauge = getContract(ICurveGauge, pool.gauge);
  const calls = [
    {
      rewardRate: gauge.methods.inflation_rate(weekEpoch),
      totalSupply: gauge.methods.totalSupply(),
      workingSupply: gauge.methods.working_supply(),
    },
  ];
  const res = await multicall.all([calls]);
  const rewardRate = new BigNumber(res[0][0].rewardRate);
  const totalSupply = new BigNumber(res[0][0].totalSupply);
  const workingSupply = new BigNumber(res[0][0].workingSupply);

  return rewardRate
    .times(secondsPerYear)
    .times(0.4)
    .times(crvPrice)
    .times(totalSupply)
    .div(workingSupply)
    .dividedBy('1e18');
};

const getYearlyRewardsInUsd = async (web3, multicall, pool) => {
  let yearlyRewardsInUsd = pool.boosted
    ? await getBoostedYearlyRewardsInUsd(web3, multicall, pool)
    : new BigNumber(0);

  for (const rewards of pool.rewards ?? []) {
    let periodFinish, rewardRate;
    if (pool.boosted) {
      const rewardStream = getContractWithProvider(ICurveGauge, pool.gauge, web3);
      let { period_finish, rate } = await rewardStream.methods.reward_data(rewards.token).call();
      periodFinish = Number(period_finish);
      rewardRate = new BigNumber(rate);
    } else if (rewards.token) {
      const rewardStream = getContractWithProvider(ICurveRewards, rewards.stream, web3);
      let { period_finish, rate } = await rewardStream.methods.reward_data(rewards.token).call();
      periodFinish = Number(period_finish);
      rewardRate = new BigNumber(rate);
    } else {
      const rewardStream = getContractWithProvider(IRewardStream, rewards.stream, web3);
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

module.exports = {
  getCurveBaseApys,
  getCurveBaseApysOld,
  getCurveFactoryApy,
  getTotalStakedInUsd,
  getYearlyRewardsInUsd,
};
