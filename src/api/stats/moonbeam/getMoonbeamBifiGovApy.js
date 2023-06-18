const { MOONBEAM_CHAIN_ID } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getBifiGovApr } from '../common/getBifiGovApr';
const {
  moonbeam: {
    platforms: { beefyfinance },
    tokens: { BIFI },
  },
} = addressBook;

const REWARD_ORACLE = 'WGLMR';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getMoonbeamBifiGovApy = async () => {
  return await getBifiGovApr(
    MOONBEAM_CHAIN_ID,
    'moonbeam',
    REWARD_ORACLE,
    DECIMALS,
    beefyfinance.rewardPool,
    BIFI.address,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getMoonbeamBifiGovApy;
