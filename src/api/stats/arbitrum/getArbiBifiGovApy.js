const { getBifiGovApr } = require('../common/getBifiGovApr');
const { ARBITRUM_CHAIN_ID } = require('../../../constants');
const { addressBook } = require('../../../../packages/address-book/address-book');

const {
  arbitrum: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI },
  },
} = addressBook;

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getArbiBifiGovApy = async () => {
  return getBifiGovApr(
    ARBITRUM_CHAIN_ID,
    'arbi',
    'WETH',
    DECIMALS,
    rewardPool,
    oldBIFI.address,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = { getArbiBifiGovApy };
