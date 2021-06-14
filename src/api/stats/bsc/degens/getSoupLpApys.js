const { bscWeb3: web3 } = require('../../../../utils/web3');
const BigNumber = require('bignumber.js');

const MssRewardPool = require('../../../../abis/MssRewardPool.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/degens/soupLpPools.json');
const { compound } = require('../../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');

const rewardPool = '0x034aF5a55e4316D975A29672733B9791c397b6AF';
const oracleId = 'SOUPS';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getSoupLpApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(rewardPool, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (rewardPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(rewardPool, pool.poolId),
    getTotalLpStakedInUsd(rewardPool, pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (rewardPool, poolId) => {
  const rewardPoolContract = new web3.eth.Contract(MssRewardPool, rewardPool);

  let { allocPoint, lastRewardBlock } = await rewardPoolContract.methods.poolInfo(poolId).call();
  allocPoint = new BigNumber(allocPoint);
  lastRewardBlock = Number(lastRewardBlock);

  let [blockRewards, totalAllocPoint] = await Promise.all([
    rewardPoolContract.methods.getGeneratedReward(lastRewardBlock, lastRewardBlock + 1).call(),
    rewardPoolContract.methods.totalAllocPoint().call(),
  ]);

  blockRewards = new BigNumber(blockRewards);
  totalAllocPoint = new BigNumber(totalAllocPoint);

  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const mssPrice = await fetchPrice({ oracle: oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(mssPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getSoupLpApys;
