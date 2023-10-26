const { getBifiGovApr } = require('../common/getBifiGovApr');
const { FANTOM_CHAIN_ID } = require('../../../constants');
const { addressBook } = require('../../../../packages/address-book/address-book');
const {
  fantom: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI },
  },
} = addressBook;

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getFantomBifiGovApy = async () => {
  return await getBifiGovApr(
    FANTOM_CHAIN_ID,
    'fantom',
    'WFTM',
    DECIMALS,
    rewardPool,
    oldBIFI.address,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getFantomBifiGovApy;
