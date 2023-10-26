const { getBifiGovApr } = require('../common/getBifiGovApr');
const { AVAX_CHAIN_ID } = require('../../../constants');
const { addressBook } = require('../../../../packages/address-book/address-book');

const {
  avax: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI },
  },
} = addressBook;

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getAvaxBifiGovApy = async () => {
  return await getBifiGovApr(
    AVAX_CHAIN_ID,
    'avax',
    'AVAX',
    DECIMALS,
    rewardPool,
    oldBIFI.address,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getAvaxBifiGovApy;
