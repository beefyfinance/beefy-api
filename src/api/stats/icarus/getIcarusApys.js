const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const IcarusPool = require('../../../abis/IcarusPool.json');
const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/icarusLpPools.json');
const { getTotalLpStakedInUsd, getTotalStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { compound } = require('../../../utils/compound');
const { BASE_HPY } = require('../../constants');

const oracle = 'tokens';
const oracleId = 'ICA';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

// zeth 0x54559aD7Ec464af2FC360B9405412eC8bB0F48Ed

const getIcarusApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool),
    getTotalStakedInUsd(pool.pool, pool.address, pool.oracle, pool.oracleId),
    getTotalLpStakedInUsd(pool.pool, pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  // console.log(pool.name, simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async pool => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const icarusPoolContract = new web3.eth.Contract(IcarusPool, pool.pool);
  const stakeRewardAddress = await icarusPoolContract.methods.stakeRewardContract().call();

  const rewardPoolContract = new web3.eth.Contract(IRewardPool, stakeRewardAddress);
  const rewardRate = new BigNumber(await rewardPoolContract.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getIcarusApys;
