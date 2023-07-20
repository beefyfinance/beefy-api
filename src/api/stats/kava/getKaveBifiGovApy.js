const { KAVA_CHAIN_ID } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getBifiGovApr } from '../common/getBifiGovApr';
const {
  kava: {
    platforms: { beefyfinance },
    tokens: { BIFI },
  },
} = addressBook;

const REWARD_ORACLE = 'WKAVA';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getKavaBifiGovApy = async () => {
  return await getBifiGovApr(
    KAVA_CHAIN_ID,
    'kava',
    REWARD_ORACLE,
    DECIMALS,
    beefyfinance.rewardPool,
    BIFI.address,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getKavaBifiGovApy;
