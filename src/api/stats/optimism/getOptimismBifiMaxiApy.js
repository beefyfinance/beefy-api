import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { OPTIMISM_CHAIN_ID } from '../../../constants';
const {
  optimism: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, ETH },
  },
} = addressBook;

export const getOptimismBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: ETH.symbol,
    rewardDecimals: getEDecimals(ETH.decimals),
    chain: 'optimism',
    chainId: OPTIMISM_CHAIN_ID,
  });
};
