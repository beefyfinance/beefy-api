const pools = require('../../../../data/bakeryLpPools.json');
const { compound } = require('../../../../utils/compound');
const getYearlyRewardsInUsd = require('./getYearlyRewardsInUsd');
const { getTotalLpStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../../constants');

const getBakeryLpApys = async () => {
  let apys = {};
  const bakeryMaster = '0x20eC291bB8459b6145317E7126532CE7EcE5056f';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(bakeryMaster, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (bakeryMaster, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(bakeryMaster, pool.address),
    getTotalLpStakedInUsd(bakeryMaster, pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

module.exports = getBakeryLpApys;
