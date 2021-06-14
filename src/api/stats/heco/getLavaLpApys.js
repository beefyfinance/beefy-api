const BigNumber = require('bignumber.js');
const { hecoWeb3: web3 } = require('../../../utils/web3');

const LavaPool = require('../../../abis/LavaPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/heco/lavaLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../constants');

const getLavaLpApys = async () => {
  let apys = {};
  const lavaPool = '0x9d90609B6C90cC378FE15BFA9EDf249d3f3ABf6e';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(lavaPool, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (lavaPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(lavaPool, pool),
    getTotalLpStakedInUsd(lavaPool, pool, pool.chainId),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (lavaPool, pool) => {
  const lavaPoolContract = new web3.eth.Contract(LavaPool, lavaPool);

  const blockRewards = new BigNumber(await lavaPoolContract.methods.sushiPerBlock().call());

  let { allocPoint } = await lavaPoolContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await lavaPoolContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const lavaPrice = await fetchPrice({ oracle: 'tokens', id: 'LAVA' });
  const yearlyRewardsInUsd = yearlyRewards.times(lavaPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getLavaLpApys;
