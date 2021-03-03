const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../utils/web3');

const IRewardPool = require('../../abis/IRewardPool.json');
const MooToken = require('../../abis/MooToken.json');
const fetchPrice = require('../../utils/fetchPrice');
const pools = require('../../data/stakePools.json');
const { compound } = require('../../utils/compound');
const { BASE_HPY } = require('../../../constants');

const INTERVAL = 15 * 60 * 1000;
const BLOCKS_PER_DAY = 28800;

let stakedPoolsData = {};

const getStakePoolsData = () => {
  return stakedPoolsData;
};

const updateStakePools = async () => {
  stakedPoolsData = await getStakePools();
  console.log('> getStakePools');
  setTimeout(updateStakePools, INTERVAL);
};

const getStakePools = async () => {
  let promises = [];
  pools.forEach(pool => promises.push(getPoolData(pool)));
  const data = await Promise.all(promises);
  return { 'data': data };
};

const getPoolData = async (pool) => {
  const [yearlyRewardsInUsd, [totalStaked, totalStakedInUsd], status] = await Promise.all([
    getYearlyRewardsInUsd(pool),
    getTotalStaked(pool),
    getStatus(pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY);

  return {
    'id': pool.id,
    'name': pool.name,
    'apy': apy,
    'status': status,
    'staked': totalStaked.toFixed(2),
    'tvl': totalStakedInUsd.toFixed(2),
  };
};

const getTotalStaked = async (pool) => {
  const tokenContract = new web3.eth.Contract(IRewardPool, pool.address);
  let totalStaked = new BigNumber(await tokenContract.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle: pool.stakedOracle, id: pool.stakedOracleId });
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

const getYearlyRewardsInUsd = async (pool) => {
  const tokenPrice = await fetchPrice({ oracle: pool.rewardOracle, id: pool.rewardOracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, pool.address);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(pool.rewardDecimals);

  return yearlyRewardsInUsd;
};

const getStatus = async (pool) => {
  const timestamp = Math.floor(Date.now() / 1000);

  const rewardPool = new web3.eth.Contract(IRewardPool, pool.address);
  const periodFinish = Number(await rewardPool.methods.periodFinish().call());

  if (pool.id !== 'bifi-bnb' && periodFinish <= timestamp) {
    return 'closed';
  }

  return 'active';
};

updateStakePools();

module.exports = getStakePoolsData;
