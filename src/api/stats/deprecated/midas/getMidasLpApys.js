const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const ShareRewardPool = require('../../../../abis/SbdoRewardPool.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../data/midasLpPools.json');
const { compound } = require('../../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { BASE_HPY, BSC_CHAIN_ID } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');

const getMidasLpApys = async () => {
  let apys = {};
  const shareRewardPool = '0xecC17b190581C60811862E5dF8c9183dA98BD08a';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(shareRewardPool, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (shareRewardPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(shareRewardPool, pool.poolId),
    getTotalLpStakedInUsd(shareRewardPool, pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (shareRewardPool, poolId) => {
  const currentBlock = await getBlockNumber(BSC_CHAIN_ID);
  const rewardPoolContract = new web3.eth.Contract(ShareRewardPool, shareRewardPool);

  let [blockRewards, totalAllocPoint] = await Promise.all([
    rewardPoolContract.methods.getGeneratedReward(currentBlock, currentBlock + 1).call(),
    rewardPoolContract.methods.totalAllocPoint().call(),
  ]);

  blockRewards = new BigNumber(blockRewards);
  totalAllocPoint = new BigNumber(totalAllocPoint);

  let { allocPoint } = await rewardPoolContract.methods.poolInfo(poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const bdoPrice = await fetchPrice({ oracle: 'tokens', id: 'MDS' });
  const yearlyRewardsInUsd = yearlyRewards.times(bdoPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getMidasLpApys;
