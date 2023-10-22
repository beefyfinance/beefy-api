import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { OPTIMISM_CHAIN_ID } from '../../../constants';
const {
  optimism: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI, ETH },
  },
} = addressBook;

export const getOptimismBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: oldBIFI.address,
    rewardPool: rewardPool,
    rewardId: ETH.symbol,
    rewardDecimals: getEDecimals(ETH.decimals),
    chain: 'optimism',
    chainId: OPTIMISM_CHAIN_ID,
  });
};
