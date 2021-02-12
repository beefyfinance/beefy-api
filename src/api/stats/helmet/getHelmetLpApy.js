const BigNumber = require('bignumber.js');
const { web3 } = require('../../../utils/web3');

const HelmetStakingPool = require('../../../abis/HelmetStakingPool.json');
const pools = require('../../../data/helmetLpPools.json');
const { compound } = require('../../../utils/compound');
const fetchPrice = require('../../../utils/fetchPrice');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { getYearlyRewardsInUsd: getCakeYearlyRewardsInUsd } = require('../pancake/getCakeLpApys');
const { BASE_HPY } = require('../../../../constants');

// Pool 1 mines self pool
// Pool 2 mines helmet-bnb from pancakeswap
const getHelmetLpApy = async () => {
  const stakingPool = '0xb22425206D40605E9bE5a5460786DBaB5aBA9485'; // Pool 1
  const masterchef = '0x73feaa1eE314F8c655E354234017bE2193C9E24E'; // Pool 2
  const pool = pools[0]; // Only 1 pool

  const [
    pool1YearlyRewardsInUsd,
    pool2YearlyRewardsInUsd,
    pool2TotalStakedInUsd,
  ] = await Promise.all([
    getYearlyRewardsInUsd(stakingPool, pool.poolId),
    getCakeYearlyRewardsInUsd(masterchef, pool),
    getTotalLpStakedInUsd(masterchef, pool),
  ]);

  return getPoolApy(pool1YearlyRewardsInUsd, pool2YearlyRewardsInUsd, pool2TotalStakedInUsd, pool);
};

const getPoolApy = (
  pool1YearlyRewardsInUsd,
  pool2YearlyRewardsInUsd,
  pool2TotalStakedInUsd,
  pool
) => {
  const totalYearlyRewardsInUsd = pool1YearlyRewardsInUsd.plus(pool2YearlyRewardsInUsd);
  const simpleApy = totalYearlyRewardsInUsd.dividedBy(pool2TotalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.94);

  return { [pool.name]: apy };
};

// Self pool
const getYearlyRewardsInUsd = async stakingPool => {
  const stakingPoolContract = new web3.eth.Contract(HelmetStakingPool, stakingPool);

  let [rewardsDurationSeconds, rewardForDuration] = await Promise.all([
    stakingPoolContract.methods.rewardsDuration().call(),
    stakingPoolContract.methods.getRewardForDuration().call(),
  ]);

  rewardsDurationSeconds = new BigNumber(rewardsDurationSeconds);
  rewardForDuration = new BigNumber(rewardForDuration);

  const secondsPerYear = 31536000;
  const yearlyRewards = rewardForDuration.div(rewardsDurationSeconds).times(secondsPerYear);

  const price = await fetchPrice({ oracle: 'pancake', id: 'Helmet' });
  const yearlyRewardsInUsd = yearlyRewards.times(price).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getHelmetLpApy;
