const { getBifiGovApr } = require('../common/getBifiGovApr');
const { METIS_CHAIN_ID } = require('../../../constants');
const { addressBook } = require('../../../../packages/address-book/address-book');

const {
  metis: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI },
  },
} = addressBook;

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getMetisBifiGovApy = async () => {
  return await getBifiGovApr(
    METIS_CHAIN_ID,
    'metis',
    'METIS',
    DECIMALS,
    rewardPool,
    oldBIFI.address,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getMetisBifiGovApy;
