const { getBifiGovApr } = require('../common/getBifiGovApr');
const { FANTOM_CHAIN_ID } = require('../../../constants');

const BIFI = '0xd6070ae98b8069de6B494332d1A1a81B6179D960';
const REWARDS = '0x7fB900C14c9889A559C777D016a885995cE759Ee';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getFantomBifiGovApy = async () => {
  return await getBifiGovApr(
    FANTOM_CHAIN_ID,
    'fantom',
    'WFTM',
    DECIMALS,
    REWARDS,
    BIFI,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getFantomBifiGovApy;
