const { getBifiGovApr } = require('../common/getBifiGovApr');
const { ONE_CHAIN_ID } = require('../../../constants');

const BIFI = '0x6ab6d61428fde76768d7b45d8bfeec19c6ef91a8';
const REWARDS = '0x5b96bbaca98d777cb736dd89a519015315e00d02';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getOneBifiGovApy = async () => {
  return await getBifiGovApr(
    ONE_CHAIN_ID,
    'one',
    'WONE',
    DECIMALS,
    REWARDS,
    BIFI,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = { getOneBifiGovApy };
