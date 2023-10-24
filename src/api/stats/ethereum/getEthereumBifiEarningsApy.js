const { ETH_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getBifiGovApr } from '../common/getBifiGovApr';
const {
  ethereum: {
    platforms: { beefyfinance },
    tokens: { oldBIFI },
  },
} = addressBook;

const REWARD_ORACLE = 'WETH';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getEthereumBifiGovApy = async () => {
  return await getBifiGovApr(
    chainId,
    'ethereum',
    REWARD_ORACLE,
    DECIMALS,
    beefyfinance.rewardPool,
    oldBIFI.address,
    3 * 365,
    3,
    BLOCKS_PER_DAY
  );
};

module.exports = getEthereumBifiGovApy;
