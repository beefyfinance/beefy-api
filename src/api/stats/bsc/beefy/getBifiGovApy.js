const { addressBook } = require('../../../../../packages/address-book/address-book');
const { BSC_CHAIN_ID } = require('../../../../constants');
const { getBifiGovApr } = require('../../common/getBifiGovApr');

const {
  bsc: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI },
  },
} = addressBook;

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getBifiGovApy = async () => {
  return getBifiGovApr(
    BSC_CHAIN_ID,
    '',
    'BNB',
    DECIMALS,
    rewardPool,
    oldBIFI.address,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getBifiGovApy;
