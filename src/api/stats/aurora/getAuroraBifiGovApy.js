import { addressBook } from '../../../../packages/address-book/address-book';
import { AURORA_CHAIN_ID } from '../../../constants';
import { getBifiGovApr } from '../common/getBifiGovApr';

const {
  aurora: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI },
  },
} = addressBook;

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getAuroraBifiGovApy = async () => {
  return await getBifiGovApr(
    AURORA_CHAIN_ID,
    'aurora',
    'ETH',
    DECIMALS,
    rewardPool,
    oldBIFI.address,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getAuroraBifiGovApy;
