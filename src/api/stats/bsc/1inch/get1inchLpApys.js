const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const IRewardPool = require('../../../../abis/IRewardPool.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/1inchLpPools.json');
const { compound } = require('../../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');

const stakingPool = '0x5d0ec1f843c1233d304b96dbde0cab9ec04d71ef';
const oracle = 'tokens';
const oracleId = '1INCH';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const get1inchLpApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(stakingPool, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (stakingPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalLpStakedInUsd(stakingPool, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, stakingPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = get1inchLpApys;
