const { getBifiGovApr } = require('../common/getBifiGovApr');
const { ONE_CHAIN_ID } = require('../../../constants');
const { addressBook } = require('../../../../packages/address-book/address-book');

const {
  one: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI },
  },
} = addressBook;

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getOneBifiGovApy = async () => {
  return await getBifiGovApr(
    ONE_CHAIN_ID,
    'one',
    'WONE',
    DECIMALS,
    rewardPool,
    oldBIFI,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = { getOneBifiGovApy };
