const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { compound } = require('../../../../utils/compound');
const getYearlyRewardsInUsd = require('./getYearlyRewardsInUsd');
const { BASE_HPY } = require('../../../../constants');

const getBakePoolApy = async () => {
  const bakeryMaster = '0x20eC291bB8459b6145317E7126532CE7EcE5056f';
  const bake = '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5';
  const oracle = 'tokens';
  const oracleId = 'BAKE';

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(bakeryMaster, bake),
    getTotalStakedInUsd(bakeryMaster, bake, oracle, oracleId),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);

  return { 'bakery-bake': apy };
};

module.exports = getBakePoolApy;
