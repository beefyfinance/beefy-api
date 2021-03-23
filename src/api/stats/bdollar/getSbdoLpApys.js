const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const SbdoRewardPool = require('../../../abis/SbdoRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/bdollarSbdoLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../../constants');

const getBdoLpApys = async () => {
  let apys = {};
  const sbdoRewardPool = '0x948dB1713D4392EC04C86189070557C5A8566766';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(sbdoRewardPool, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (sbdoRewardPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(sbdoRewardPool, pool.poolId),
    getTotalLpStakedInUsd(sbdoRewardPool, pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (sbdoRewardPool, poolId) => {
  const currentBlock = await web3.eth.getBlockNumber();
  const bdoRewardPoolContract = new web3.eth.Contract(SbdoRewardPool, sbdoRewardPool);

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

  const bdoPrice = await fetchPrice({ oracle: 'tokens', id: 'sBDO' });
  const yearlyRewardsInUsd = yearlyRewards.times(bdoPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getBdoLpApys;
