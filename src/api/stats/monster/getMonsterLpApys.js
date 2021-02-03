const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const MssRewardPool = require('../../../abis/MssRewardPool.json');
const { getPrice } = require('../../../utils/getPrice');
const pools = require('../../../data/monsterLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');

const web3 = new Web3(process.env.BSC_RPC_2 || process.env.BSC_RPC);

const getMonsterLpApys = async () => {
  let apys = {};
  const mssRewardPool = '0x3646de962ff41462cc244b2379e7289b9b751be1';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(mssRewardPool, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (mssRewardPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(mssRewardPool, pool.poolId),
    getTotalLpStakedInUsd(mssRewardPool, pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (mssRewardPool, poolId) => {
  const mssRewardPoolContract = new web3.eth.Contract(MssRewardPool, mssRewardPool);

  let { allocPoint, lastRewardBlock } = await mssRewardPoolContract.methods.poolInfo(poolId).call();
  allocPoint = new BigNumber(allocPoint);
  lastRewardBlock = Number(lastRewardBlock);

  let [blockRewards, totalAllocPoint] = await Promise.all([
    mssRewardPoolContract.methods.getGeneratedReward(lastRewardBlock, lastRewardBlock + 1).call(),
    mssRewardPoolContract.methods.totalAllocPoint().call(),
  ]);

  blockRewards = new BigNumber(blockRewards);
  totalAllocPoint = new BigNumber(totalAllocPoint);

  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const mssPrice = await getPrice('pancake', 'MSS');
  const yearlyRewardsInUsd = yearlyRewards.times(mssPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getMonsterLpApys;
