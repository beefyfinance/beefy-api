const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const NutsLPStaking = require('../../../../abis/degens/NutsLPStaking.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/degens/nutsLpPools.json');
const { compound } = require('../../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');

const stakingPool = '0x03d9d14367127d477e6F340C59E57ab088220187';
const oracleId = 'NUTS';
const oracle = 'tokens';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getSquirrelApys = async () => {
  const nutsStakingApr = 1; // hardcoded 100% APR
  let apys = { 'squirrel-nuts': compound(nutsStakingApr, process.env.BASE_HPY, 1, 0.955) };

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
    getYearlyRewardsInUsd(stakingPool, pool),
    getTotalLpStakedInUsd(stakingPool, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async stakingPool => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(NutsLPStaking, stakingPool);
  const rewardRate = new BigNumber(await rewardPool.methods.nutsPerEpoch().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getSquirrelApys;
