import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { ARBITRUM_CHAIN_ID } from '../../../constants';
const {
  arbitrum: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI, ETH },
  },
} = addressBook;

export const getArbiBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: oldBIFI.address,
    rewardPool: rewardPool,
    rewardId: ETH.symbol,
    rewardDecimals: getEDecimals(ETH.decimals),
    chain: 'arbi',
    chainId: ARBITRUM_CHAIN_ID,
  });
};
