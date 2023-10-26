import { addressBook } from '../../../../packages/address-book/address-book';
import { OPTIMISM_CHAIN_ID } from '../../../constants';
import { getBifiGovApr } from '../common/getBifiGovApr';
const {
  optimism: {
    platforms: { beefyfinance },
    tokens: { oldBIFI },
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
    oldBIFI.address,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getOptimismBifiGovApy;
