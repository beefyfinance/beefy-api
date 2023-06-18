const { BSC_CHAIN_ID } = require('../../../../constants');
const { getBifiGovApr } = require('../../common/getBifiGovApr');

const BIFI = '0xCa3F508B8e4Dd382eE878A314789373D80A5190A';
const REWARDS = '0x0d5761D9181C7745855FC985f646a842EB254eB9';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getBifiGovApy = async () => {
  return getBifiGovApr(
    BSC_CHAIN_ID,
    '',
    'BNB',
    DECIMALS,
    REWARDS,
    BIFI,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getBifiGovApy;
