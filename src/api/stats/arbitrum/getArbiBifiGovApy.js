const { getBifiGovApr } = require('../common/getBifiGovApr');
const { ARBITRUM_CHAIN_ID } = require('../../../constants');

const BIFI = '0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE';
const REWARDS = '0x48F4634c8383aF01BF71AefBC125eb582eb3C74D';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getArbiBifiGovApy = async () => {
  return getBifiGovApr(
    ARBITRUM_CHAIN_ID,
    'arbi',
    'WETH',
    DECIMALS,
    REWARDS,
    BIFI,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = { getArbiBifiGovApy };
