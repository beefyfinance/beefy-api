const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const BdoRewardPool = require('../../../abis/BdoRewardPool.json');
const { getPrice } = require('../../../utils/getPrice');
const pools = require('../../../data/bdollarBdoLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');

const web3 = new Web3(process.env.BSC_RPC_2 || process.env.BSC_RPC);

const getBdoLpApys = async () => {
  let apys = {};
  const bdoRewardPool = '0x7A4cFC24841c799832fFF4E5038BBA14c0e73ced';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(bdoRewardPool, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (bdoRewardPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(bdoRewardPool, pool.poolId),
    getTotalLpStakedInUsd(bdoRewardPool, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (bdoRewardPool, poolId) => {
  const currentBlock = await web3.eth.getBlockNumber();
  const bdoRewardPoolContract = new web3.eth.Contract(BdoRewardPool, bdoRewardPool);

  let [blockRewards, totalAllocPoint] = await Promise.all([
    bdoRewardPoolContract.methods.getGeneratedReward(currentBlock, currentBlock + 1).call(),
    bdoRewardPoolContract.methods.totalAllocPoint().call(),
  ]);

  blockRewards = new BigNumber(blockRewards);
  totalAllocPoint = new BigNumber(totalAllocPoint);

  let { allocPoint } = await bdoRewardPoolContract.methods.poolInfo(poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const bdoPrice = await getPrice('pancake', 'BDO');
  const yearlyRewardsInUsd = yearlyRewards.times(bdoPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getBdoLpApys;
