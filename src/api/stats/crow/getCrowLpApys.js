const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const MasterChef = require('../../../abis/CrowMasterChef.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/crowLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');

const getCrowLpApys = async () => {
  let apys = {};
  const masterchef = '0xB5ff2e278A1093850c4C0892b3b0FBF757BDbe67';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(masterchef, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (masterchef, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalLpStakedInUsd(masterchef, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await web3.eth.getBlockNumber();
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  /*   const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call(),
  ); */
  const multiplier = 1;
  const blockRewards = new BigNumber(
    await masterchefContract.methods.getCurrentCrowRewardPerBlock().call()
  );

  let { allocPoint } = await masterchefContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const crowPrice = await fetchPrice({ oracle: 'pancake', id: 'CROW' });
  const yearlyRewardsInUsd = yearlyRewards.times(crowPrice).dividedBy('1e18').times(0.96); // 2 times an average burn of 2%

  return yearlyRewardsInUsd;
};

module.exports = getCrowLpApys;
