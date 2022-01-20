const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const IRewardPool = require('../../../../abis/IRewardPool.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const { DAILY_HPY } = require('../../../../constants');

const pools = [
  {
    name: 'pots-pots',
    rewardPool: '0xcF4C1D926547a491204C3C9BD52F282EdE0539E5',
    oracle: 'tokens',
    oracleId: 'POTS',
    decimals: '1e18',
  },
  {
    name: 'pots-watch',
    rewardPool: '0xE3C50fe260B7a258C8B16C36a98FB6D2DEeDD90E',
    oracle: 'tokens',
    oracleId: 'WATCH',
    decimals: '1e18',
  },
  {
    name: 'pots-bino',
    rewardPool: '0x71e3d841681fecE65Be9BFcBD318386184f784bC',
    oracle: 'tokens',
    oracleId: 'BINO',
    decimals: '1e18',
  },
];

const getMoonpotApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async pool => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool),
    getTotalStakedInUsd(pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, DAILY_HPY, 1, 1);
  return { [pool.name]: apy };
};

const getTotalStakedInUsd = async pool => {
  const rewardPool = new web3.eth.Contract(IRewardPool, pool.rewardPool);
  const totalStaked = new BigNumber(await rewardPool.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });

  return totalStaked.times(tokenPrice).dividedBy(pool.decimals);
};

const getYearlyRewardsInUsd = async pool => {
  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, pool.rewardPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const secondsPerYear = 31536000;
  const yearlyRewards = rewardRate.times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(pool.decimals);

  return yearlyRewardsInUsd;
};

module.exports = getMoonpotApys;
