const BigNumber = require('bignumber.js');

const pools = require('../../../../data/nyacashLpPools.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');

const rewardPoolNyacUsdt = '0x15DaCDb66cB7DcBC904eB5E39C71f759E645c6A3'; // NYAC-USDT
const rewardPoolNyasUsdt = '0xc60BBF8Ac0EdEE5A1FfBb1280831d96C4F063f4F'; // NYAS-USDT
const yearlyNyasRewards = {
  'nyacash-nyac-usdt': 600000,
  'nyacash-nyas-usdt': 300000,
};

const getNyacashNyasLpApys = async () => {
  let poolNyacUsdt = pools.filter(pool => pool.name === 'nyacash-nyac-usdt')[0];
  let poolNyasUsdt = pools.filter(pool => pool.name === 'nyacash-nyas-usdt')[0];

  const values = await Promise.all([
    getPoolApy(rewardPoolNyacUsdt, poolNyacUsdt),
    getPoolApy(rewardPoolNyasUsdt, poolNyasUsdt),
  ]);

  let apys = {};
  for (item of values) {
    apys = { ...apys, ...item };
  }
  return apys;
};

const getPoolApy = async (rewardPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool),
    getTotalLpStakedInUsd(rewardPool, pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async pool => {
  const yearlyRewards = new BigNumber(yearlyNyasRewards[pool.name]);
  const nyasPrice = await fetchPrice({ oracle: 'tokens', id: 'NYAS' });
  const yearlyRewardsInUsd = yearlyRewards.times(nyasPrice);

  return yearlyRewardsInUsd;
};

module.exports = getNyacashNyasLpApys;
