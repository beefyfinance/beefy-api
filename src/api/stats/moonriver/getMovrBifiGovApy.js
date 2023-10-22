const { getBifiGovApr } = require('../common/getBifiGovApr');
const { MOONRIVER_CHAIN_ID } = require('../../../constants');
const { addressBook } = require('../../../../packages/address-book/address-book');

const {
  moonriver: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI },
  },
} = addressBook;

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getMovrBifiGovApy = async () => {
  return await getBifiGovApr(
    MOONRIVER_CHAIN_ID,
    'movr',
    'WMOVR',
    DECIMALS,
    rewardPool,
    oldBIFI.address,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = { getMovrBifiGovApy };
