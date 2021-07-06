const axios = require('axios');
const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

import getApyBreakdown from '../../common/getApyBreakdown';

const fetchPrice = require('../../../../utils/fetchPrice');
const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const EllipsisLpStaker = require('../../../../abis/EllipsisLpStaker.json');
const EllipsisOracle = require('../../../../abis/EllipsisOracle.json');
const EllipsisRewardToken = require('../../../../abis/EllipsisRewardToken.json');
const swapPool = require('../../../../data/ellipsisPools.json');
const lpPools = require('../../../../data/ellipsisLpPools.json');
const pools = [...swapPool, ...lpPools];

const stakingPool = '0xcce949De564fE60e7f96C85e55177F8B9E4CF61b';
const oracle = 'tokens';
const oracleId = 'EPS';

const DECIMALS = '1e18';
const secondsPerYear = 31536000;
const tradingFees = 0.0002;

const getEllipsisLpApys = async () => {
  const baseApys = await getBaseApys();
  const poolData = await getPoolData();
  const farmApys = [];
  for (const pool of pools) {
    const data = poolData[pool.poolId];
    const totalStakedInUsd = data.staked;
    const yearlyRewardsInUsd = data.yearlyRewardsInUsd;
    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    // console.log(pool.name, simpleApy.valueOf(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
    farmApys.push(simpleApy);
  }

  return getApyBreakdown(pools, baseApys, farmApys, tradingFees);
};

const getBaseApys = async () => {
  let apys = {};
  try {
    const response = await axios.get('https://api.ellipsis.finance/api/getPools');
    const basePools = response.data.data.basePools ?? [];
    const metaPools = response.data.data.metaPools ?? [];
    const pools = [...basePools, ...metaPools];
    pools.forEach(pool => {
      const apy = new BigNumber((pool.apy ?? 0) / 100);
      apys = { ...apys, ...{ [pool.address.toLowerCase()]: apy } };
    });
  } catch (err) {
    console.error(err);
  }
  return apys;
};

const getPoolData = async () => {
  const rewardPool = new web3.eth.Contract(EllipsisLpStaker, stakingPool);
  const poolLength = await rewardPool.methods.poolLength().call();

  const poolsData = [poolLength];
  let totalAlloc = new BigNumber(0);
  for (let pid = 1; pid < poolLength; pid++) {
    let { allocPoint, oracleIndex } = await rewardPool.methods.poolInfo(pid).call();
    let price = 1;
    if (oracleIndex !== '0') {
      const oracleAddress = await rewardPool.methods.oracles(oracleIndex).call();
      const oracle = new web3.eth.Contract(EllipsisOracle, oracleAddress);
      price = new BigNumber(await oracle.methods.latestAnswer().call()).dividedBy('1e8');
    }
    allocPoint = new BigNumber(allocPoint);
    poolsData[pid] = {
      staked: allocPoint.dividedBy(DECIMALS),
      allocPoint: allocPoint.multipliedBy(price),
    };
    totalAlloc = totalAlloc.plus(allocPoint);
  }

  // 20% from eps-bnb
  totalAlloc = totalAlloc.multipliedBy(100).dividedBy(80);

  for (const pool of pools) {
    if (pool.poolId === 0) {
      const pool0staked = await getTotalStakedInUsd(stakingPool, pool.address, 'lps', pool.name);
      poolsData[0] = {
        staked: pool0staked,
        allocPoint: totalAlloc.dividedBy(5), // eps-bnb gets 20%
      };
    } else {
      const poolData = poolsData[pool.poolId];
      const stakedPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
      poolData.staked = poolData.staked.multipliedBy(stakedPrice);
    }
  }

  const rewardRate = new BigNumber(await rewardPool.methods.rewardsPerSecond().call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewards = rewardRate.times(secondsPerYear).times(tokenPrice).dividedBy(2);
  for (let i = 0; i < poolsData.length; i++) {
    const poolData = poolsData[i];
    poolData.yearlyRewardsInUsd = yearlyRewards
      .multipliedBy(poolData.allocPoint)
      .dividedBy(totalAlloc)
      .dividedBy(DECIMALS);

    const pool = pools.find(p => p.poolId === i);
    if (pool) {
      const tokenRewards = await getRewards(pool);
      poolData.yearlyRewardsInUsd = poolData.yearlyRewardsInUsd.plus(tokenRewards);
    }
  }

  return poolsData;
};

const getRewards = async pool => {
  if (!pool.lp || !pool.rewards) return new BigNumber(0);

  let totalRewards = new BigNumber(0);
  const rewards = new web3.eth.Contract(EllipsisRewardToken, pool.lp);
  for (const reward of pool.rewards) {
    let { rewardRate, periodFinish } = await rewards.methods.rewardData(reward.token).call();
    if (Number(periodFinish) < Date.now() / 1000) {
      continue;
    }
    rewardRate = new BigNumber(rewardRate);
    const yearlyRewards = rewardRate.times(secondsPerYear);
    const tokenPrice = await fetchPrice({ oracle: reward.oracle ?? 'tokens', id: reward.oracleId });
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(reward.decimals ?? '1e18');
    totalRewards = totalRewards.plus(yearlyRewardsInUsd);
  }
  return totalRewards;
};

module.exports = getEllipsisLpApys;
