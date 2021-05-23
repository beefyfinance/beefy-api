const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const EllipsisLpStaker = require('../../../../abis/EllipsisLpStaker.json');
const EllipsisOracle = require('../../../../abis/EllipsisOracle.json');
const EllipsisRewardToken = require('../../../../abis/EllipsisRewardToken.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/ellipsisPools.json');
const { compound } = require('../../../../utils/compound');
const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');

const stakingPool = '0xcce949De564fE60e7f96C85e55177F8B9E4CF61b';
const oracle = 'tokens';
const oracleId = 'EPS';

const DECIMALS = '1e18';
const secondsPerYear = 31536000;

const getEllipsisLpApys = async () => {
  let apys = {};

  const poolData = await getPoolData();
  for (const pool of pools) {
    const data = poolData[pool.poolId];
    const totalStakedInUsd = data.staked;
    const yearlyRewardsInUsd = data.yearlyRewardsInUsd;

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
    // console.log(pool.name, simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());

    const poolApy = { [pool.name]: apy };
    apys = { ...apys, ...poolApy };
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

  totalAlloc = totalAlloc.multipliedBy(100).dividedBy(80);

  for (const pool of pools) {
    if (pool.poolId === 0) {
      const pool0staked = await getTotalStakedInUsd(
        stakingPool,
        pool.address,
        pool.oracle,
        pool.oracleId
      );
      poolsData[0] = {
        staked: pool0staked,
        allocPoint: totalAlloc.dividedBy(5),
      };
    } else {
      const poolData = poolsData[pool.poolId];
      const stakedPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
      poolData.staked = poolData.staked.multipliedBy(stakedPrice);
    }
  }

  const rewardRate = new BigNumber(await rewardPool.methods.rewardsPerSecond().call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewards = rewardRate.times(secondsPerYear).times(tokenPrice).dividedBy(2);
  poolsData.forEach(pool => {
    pool.yearlyRewardsInUsd = yearlyRewards
      .multipliedBy(pool.allocPoint)
      .dividedBy(totalAlloc)
      .dividedBy(DECIMALS);
  });

  const iceRewards = await getIceRewards();
  poolsData[2].yearlyRewardsInUsd = poolsData[2].yearlyRewardsInUsd.plus(iceRewards);

  return poolsData;
};

const getIceRewards = async () => {
  const rewards = new web3.eth.Contract(
    EllipsisRewardToken,
    '0x373410A99B64B089DFE16F1088526D399252dacE'
  );
  let { rewardRate, periodFinish } = await rewards.methods
    .rewardData('0xf16e81dce15B08F326220742020379B855B87DF9')
    .call();

  if (Number(periodFinish) < Date.now() / 1000) {
    return 0;
  }

  rewardRate = new BigNumber(rewardRate);
  const yearlyRewards = rewardRate.times(secondsPerYear);
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'ICE' });
  return yearlyRewards.times(tokenPrice).dividedBy('1e18');
};

module.exports = getEllipsisLpApys;
