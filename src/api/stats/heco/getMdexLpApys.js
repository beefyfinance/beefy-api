const BigNumber = require('bignumber.js');
const { hecoWeb3: web3 } = require('../../../utils/web3');

const HecoPool = require('../../../abis/HecoPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/heco/mdexLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../constants');

const getMdexLpApys = async () => {
  let apys = {};
  const hecoPool = '0xFB03e11D93632D97a8981158A632Dd5986F5E909';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(hecoPool, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (hecoPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(hecoPool, pool),
    getTotalLpStakedInUsd(hecoPool, pool, pool.chainId),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (hecoPool, pool) => {
  const hecoPoolContract = new web3.eth.Contract(HecoPool, hecoPool);

  const blockRewards = new BigNumber(await hecoPoolContract.methods.mdxPerBlock().call());

  let { allocPoint } = await hecoPoolContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await hecoPoolContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const mdxPrice = await fetchPrice({ oracle: 'coingecko', id: 'mdex' });
  const yearlyRewardsInUsd = yearlyRewards.times(mdxPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getMdexLpApys;
