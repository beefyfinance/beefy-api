const { getBifiGovApr } = require('../common/getBifiGovApr');
const { MOONRIVER_CHAIN_ID } = require('../../../constants');

const BIFI = '0x173fd7434B8B50dF08e3298f173487ebDB35FD14';
const REWARDS = '0x4aabd0d73181325dd1609ce696ef048702de7153';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getMovrBifiGovApy = async () => {
  return await getBifiGovApr(
    MOONRIVER_CHAIN_ID,
    'movr',
    'WMOVR',
    DECIMALS,
    REWARDS,
    BIFI,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = { getMovrBifiGovApy };
