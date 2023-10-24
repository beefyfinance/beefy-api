const { getBifiGovApr } = require('../common/getBifiGovApr');
const { POLYGON_CHAIN_ID } = require('../../../constants');
const { addressBook } = require('../../../../packages/address-book/address-book');

const {
  polygon: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI },
  },
} = addressBook;

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getPolygonBifiGovApy = async () => {
  return await getBifiGovApr(
    POLYGON_CHAIN_ID,
    'polygon',
    'WMATIC',
    DECIMALS,
    rewardPool,
    oldBIFI.address,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getPolygonBifiGovApy;
