const { getBifiGovApr } = require('../common/getBifiGovApr');
const { POLYGON_CHAIN_ID } = require('../../../constants');

const BIFI = '0xFbdd194376de19a88118e84E279b977f165d01b8';
const REWARDS = '0xDeB0a777ba6f59C78c654B8c92F80238c8002DD2';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getPolygonBifiGovApy = async () => {
  return await getBifiGovApr(
    POLYGON_CHAIN_ID,
    'polygon',
    'WMATIC',
    DECIMALS,
    REWARDS,
    BIFI,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getPolygonBifiGovApy;
