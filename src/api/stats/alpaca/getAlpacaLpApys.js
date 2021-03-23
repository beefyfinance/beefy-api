const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const FairLaunch = require('../../../abis/FairLaunch.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/alpacaLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');

const getAlpacaLpApys = async () => {
  let apys = {};
  const fairLaunch = '0xA625AB01B08ce023B2a342Dbb12a16f2C8489A8F';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(fairLaunch, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (fairLaunch, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(fairLaunch, pool),
    getTotalLpStakedInUsd(fairLaunch, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (fairLaunch, pool) => {
  const blockNum = await web3.eth.getBlockNumber();
  const fairLaunchContract = new web3.eth.Contract(FairLaunch, fairLaunch);

  const multiplier = new BigNumber(
    await fairLaunchContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await fairLaunchContract.methods.alpacaPerBlock().call());

  let { allocPoint } = await fairLaunchContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await fairLaunchContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'ALPACA' });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getAlpacaLpApys;
