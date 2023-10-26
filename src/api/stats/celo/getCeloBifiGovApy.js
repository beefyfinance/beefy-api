const { getBifiGovApr } = require('../common/getBifiGovApr');
const { CELO_CHAIN_ID } = require('../../../constants');
const { addressBook } = require('../../../../packages/address-book/address-book');

const {
  celo: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI },
  },
} = addressBook;

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getCeloBifiGovApy = async () => {
  return await getBifiGovApr(
    CELO_CHAIN_ID,
    'celo',
    'CELO',
    DECIMALS,
    rewardPool,
    oldBIFI.address,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = { getCeloBifiGovApy };
