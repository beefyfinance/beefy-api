const { getBifiGovApr } = require('../common/getBifiGovApr');
const { METIS_CHAIN_ID } = require('../../../constants');

const BIFI = '0xe6801928061CDbE32AC5AD0634427E140EFd05F9';
const REWARDS = '0x2a30C5e0d577108F694d2A96179cd73611Ee069b';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getMetisBifiGovApy = async () => {
  return await getBifiGovApr(
    METIS_CHAIN_ID,
    'metis',
    'METIS',
    DECIMALS,
    REWARDS,
    BIFI,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getMetisBifiGovApy;
