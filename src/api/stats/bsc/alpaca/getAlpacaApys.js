const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const pools = require('../../../../data/alpacaPools.json');
const { compound } = require('../../../../utils/compound');
const { BASE_HPY } = require('../../../../constants');
const getYearlyRewardsInUsd = require('./getYearlyRewardsInUsd');

const getAlpacaApys = async () => {
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
  const fairLaunch = '0xA625AB01B08ce023B2a342Dbb12a16f2C8489A8F';

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(fairLaunch, pool),
    getTotalStakedInUsd(fairLaunch, pool.token, pool.oracle, pool.oracleId),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);

  return { [pool.name]: apy };
};

module.exports = getAlpacaApys;
