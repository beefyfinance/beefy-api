const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const EllipsisLpStaker = require('../../../abis/EllipsisLpStaker.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/ellipsisLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');

const stakingPool = '0xcce949De564fE60e7f96C85e55177F8B9E4CF61b';
const oracle = 'tokens';
const oracleId = 'EPS';

const DECIMALS = '1e18';
const secondsPerYear = 31536000;

const getEllipsisLpApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(stakingPool, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (stakingPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalLpStakedInUsd(stakingPool, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  console.log(pool.name, simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(EllipsisLpStaker, stakingPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardsPerSecond().call());
  // EPS-BNB get 20% - div(5), and 50% penalty - div(2)
  const yearlyRewards = rewardRate.times(secondsPerYear).dividedBy(5).dividedBy(2);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getEllipsisLpApys;
