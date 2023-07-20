const { getBifiGovApr } = require('../common/getBifiGovApr');
const { AVAX_CHAIN_ID } = require('../../../constants');

const BIFI = '0xd6070ae98b8069de6B494332d1A1a81B6179D960';
const REWARDS = '0x86d38c6b6313c5A3021D68D1F57CF5e69197592A';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getAvaxBifiGovApy = async () => {
  return await getBifiGovApr(
    AVAX_CHAIN_ID,
    'avax',
    'AVAX',
    DECIMALS,
    REWARDS,
    BIFI,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getAvaxBifiGovApy;
