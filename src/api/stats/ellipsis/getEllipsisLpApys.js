const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const EllipsisLpStaker = require('../../../abis/EllipsisLpStaker.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/ellipsisPools.json');
const getEllipsis3PoolPrice = require('./getEllipsis3PoolPrice');
const { compound } = require('../../../utils/compound');
const { getTotalStakedInUsd } = require('../../../utils/getTotalStakedInUsd');

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
    getYearlyRewardsInUsd(pool),
    getTotalLpStakedInUsd(stakingPool, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  // console.log(pool.name, simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

const getTotalLpStakedInUsd = async (stakingPool, pool) => {
  if (pool.poolId === 0) {
    return await getTotalStakedInUsd(stakingPool, pool.address, pool.oracle, pool.oracleId);
  }
  const rewardPool = new web3.eth.Contract(EllipsisLpStaker, stakingPool);
  let { allocPoint } = await rewardPool.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  let tokenPrice;
  if (pool.poolId === 1) {
    tokenPrice = (await getEllipsis3PoolPrice())[pool.name];
  } else {
    tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  }
  return allocPoint.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async (pool) => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(EllipsisLpStaker, stakingPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardsPerSecond().call());

  let yearlyRewards;
  if (pool.poolId === 0) {
    // EPS-BNB get 20% - div(5)
    yearlyRewards = rewardRate.dividedBy(5);
  } else {
    let { allocPoint } = await rewardPool.methods.poolInfo(pool.poolId).call();
    allocPoint = new BigNumber(allocPoint);

    const totalAllocPoint = new BigNumber(await rewardPool.methods.totalAllocPoint().call());
    yearlyRewards = rewardRate.times(allocPoint).dividedBy(totalAllocPoint).times(4).dividedBy(5);
  }
  // 50 % penalty - div(2)
  yearlyRewards = yearlyRewards.times(secondsPerYear).dividedBy(2);

  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);
  return yearlyRewardsInUsd;
};

module.exports = getEllipsisLpApys;
