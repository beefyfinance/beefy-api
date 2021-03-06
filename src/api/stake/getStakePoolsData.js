const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../utils/web3');

const IRewardPool = require('../../abis/IRewardPool.json');
const BalleToken = require('../../abis/BalleToken.json');
const fetchPrice = require('../../utils/fetchPrice');
const pools = require('../../data/stakePools.json');

const INTERVAL = 5 * 60 * 1000;
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
  return { data: data };
};

const getPoolData = async pool => {
  const [yearlyRewardsInUsd, [totalStaked, totalStakedInUsd], status] = await Promise.all([
    getYearlyRewardsInUsd(pool),
    getTotalStaked(pool),
    getStatus(pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    id: pool.id,
    name: pool.name,
    apy: Number(simpleApy.toFixed(6)),
    status: status,
    staked: totalStaked.toFixed(2),
    tvl: totalStakedInUsd.toFixed(2),
  };
};

const getTotalStaked = async pool => {
  const tokenContract = new web3.eth.Contract(IRewardPool, pool.address);
  let totalStaked = new BigNumber(await tokenContract.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle: pool.stakedOracle, id: pool.stakedOracleId });
  if (pool.isBalleStaked) {
    const balleToken = new web3.eth.Contract(BalleToken, pool.stakedToken);
    const pricePerShare = new BigNumber(await balleToken.methods.getPricePerFullShare().call());
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

const getStatus = async pool => {
  return 'active';
};

updateStakePools();

module.exports = getStakePoolsData;
