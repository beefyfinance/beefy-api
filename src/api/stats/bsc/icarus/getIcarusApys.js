const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const IRewardPool = require('../../../../abis/IRewardPool.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/icarusPools.json');
const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { compound } = require('../../../../utils/compound');
const { BASE_HPY } = require('../../../../constants');

const BLOCKS_PER_DAY = 28800;

const getIcarusApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async pool => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool),
    getTotalStakedInUsd(pool.pool, pool.address, pool.oracle, pool.oracleId, pool.decimals),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  // console.log(pool.name, simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async pool => {
  let yearlyRewardsInUsd = new BigNumber(0);

  if (pool.stakedReward) {
    const rewardPool = pool.stakedReward;
    const rewardPoolContract = new web3.eth.Contract(IRewardPool, rewardPool.address);
    const rewardRate = new BigNumber(await rewardPoolContract.methods.rewardRate().call());
    const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
    const tokenPrice = await fetchPrice({ oracle: rewardPool.oracle, id: rewardPool.oracleId });
    const rewardsInUSD = yearlyRewards.times(tokenPrice).dividedBy(rewardPool.decimals);
    // console.log(pool.name, rewardPool.oracleId, rewardsInUSD.valueOf());
    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(rewardsInUSD);
  }
  if (pool.powReward) {
    const rewardPool = pool.powReward;
    const rewardPoolContract = new web3.eth.Contract(IRewardPool, rewardPool.address);
    const rewardRate = new BigNumber(await rewardPoolContract.methods.rewardRate().call());
    const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
    const tokenPrice = await fetchPrice({ oracle: rewardPool.oracle, id: rewardPool.oracleId });
    const rewardsInUSD = yearlyRewards.times(tokenPrice).dividedBy(rewardPool.decimals);
    // console.log(pool.name, rewardPool.oracleId, rewardsInUSD.valueOf());
    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(rewardsInUSD);
  }

  return yearlyRewardsInUsd;
};

module.exports = getIcarusApys;
