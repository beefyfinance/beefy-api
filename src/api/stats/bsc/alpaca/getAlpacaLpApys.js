const pools = require('../../../../data/alpacaLpPools.json');
const { compound } = require('../../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const getYearlyRewardsInUsd = require('./getYearlyRewardsInUsd');

const getAlpacaLpApys = async () => {
  let apys = {};
  const fairLaunch = '0xA625AB01B08ce023B2a342Dbb12a16f2C8489A8F';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(fairLaunch, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
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

module.exports = getAlpacaLpApys;
