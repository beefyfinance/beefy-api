const BigNumber = require('bignumber.js');
const { fantomWeb3: web3 } = require('../../../utils/web3');

const LpStaker = require('../../../abis/EllipsisLpStaker.json');
const Oracle = require('../../../abis/EllipsisOracle.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/fantom/froyoPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalStakedInUsd } = require('../../../utils/getTotalStakedInUsd');

const stakingPool = '0x93b1531Ca2d6595e6bEE8bd3d306Fcdad5775CDE';
const oracle = 'tokens';
const oracleId = 'FROYO';

const DECIMALS = '1e18';
const CHAIN_ID = 250;
const secondsPerYear = 31536000;

const getFroyoLpApys = async () => {
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
  const rewardPool = new web3.eth.Contract(LpStaker, stakingPool);
  const poolLength = await rewardPool.methods.poolLength().call();

  const poolsData = [poolLength];
  let totalAlloc = new BigNumber(0);
  for (let pid = 1; pid < poolLength; pid++) {
    let { allocPoint, oracleIndex } = await rewardPool.methods.poolInfo(pid).call();
    let price = 1;
    if (oracleIndex !== '0') {
      const oracleAddress = await rewardPool.methods.oracles(oracleIndex).call();
      const oracle = new web3.eth.Contract(Oracle, oracleAddress);
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
        pool.oracleId,
        DECIMALS,
        CHAIN_ID
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

  return poolsData;
};

module.exports = getFroyoLpApys;
