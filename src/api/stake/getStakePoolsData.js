const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../utils/web3');

const IRewardPool = require('../../abis/IRewardPool.json');
const MooToken = require('../../abis/MooToken.json');
const fetchPrice = require('../../utils/fetchPrice');
const pools = require('../../data/stakePools.json');
const getEllipsis3PoolPrice = require('../stats/ellipsis/getEllipsis3PoolPrice');

const INTERVAL = 3 * 60 * 1000;
const INIT_DELAY = 4 * 60 * 1000;
const BLOCKS_PER_DAY = 28800;

let stakedPoolsData = {};

const getStakePoolsData =   () => {
  return stakedPoolsData;
};

const updateStakePools = async () => {
  console.log('> updating stake pools');
  try{
    stakedPoolsData = await getStakePools();
    console.log('> updated stake pools');
  } catch (err) {
    console.error('> stake pool update failed', err);
  }
  setTimeout(updateStakePools, INTERVAL);
};

const getStakePools = async () => {
  let promises = [];
  pools.forEach(pool => promises.push(getPoolData(pool)));
  const data = await Promise.all(promises);
  return { data: data };
};

const getPoolData = async pool => {
  const [yearlyRewardsInUsd, [totalStaked, totalStakedInUsd]] = await Promise.all([
    getYearlyRewardsInUsd(pool),
    getTotalStaked(pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    id: pool.id,
    name: pool.name,
    apy: Number(simpleApy.toFixed(6)),
    staked: totalStaked.toFixed(2),
    tvl: totalStakedInUsd.toFixed(2),
  };
};

const getTotalStaked = async pool => {
  const tokenContract = new web3.eth.Contract(IRewardPool, pool.address);
  let totalStaked = new BigNumber(await tokenContract.methods.totalSupply().call());
  let tokenPrice = await fetchPrice({ oracle: pool.stakedOracle, id: pool.stakedOracleId });
  if (pool.id === 'moo_ellipsis_3pool-zefi') {
    tokenPrice = (await getEllipsis3PoolPrice())['ellipsis-3eps'];
  }
  if (pool.isMooStaked) {
    const mooToken = new web3.eth.Contract(MooToken, pool.stakedToken);
    const pricePerShare = new BigNumber(await mooToken.methods.getPricePerFullShare().call());
    totalStaked = totalStaked.times(pricePerShare).dividedBy(pool.stakedDecimals);
  }
  return [
    totalStaked.dividedBy(pool.stakedDecimals),
    totalStaked.times(tokenPrice).dividedBy(pool.stakedDecimals),
  ];
};

const getYearlyRewardsInUsd = async pool => {
  const tokenPrice = await fetchPrice({ oracle: pool.rewardOracle, id: pool.rewardOracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, pool.address);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(pool.rewardDecimals);

  return yearlyRewardsInUsd;
};

// Flexible delayed initialization used to work around ratelimits
setTimeout(updateStakePools, INIT_DELAY);

module.exports = getStakePoolsData;
