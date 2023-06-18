import { addressBook } from '../../../../packages/address-book/address-book';
import { OPTIMISM_CHAIN_ID } from '../../../constants';
const {
  optimism: {
    platforms: { beefyfinance },
    tokens: { BIFI },
  },
} = addressBook;

const REWARD_ORACLE = 'WETH';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getOptimismBifiGovApy = async () => {
  return await getBifiGovApr(
    OPTIMISM_CHAIN_ID,
    'optimism',
    REWARD_ORACLE,
    DECIMALS,
    beefyfinance.rewardPool,
    BIFI.address,
    3 * 365,
    3,
    BLOCKS_PER_DAY
  );
};

module.exports = getOptimismBifiGovApy;
