import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { FUSE_CHAIN_ID } from '../../../constants';
const {
  fuse: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI, WFUSE },
  },
} = addressBook;

export const getFuseBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: oldBIFI.address,
    rewardPool: rewardPool,
    rewardId: WFUSE.symbol,
    rewardDecimals: getEDecimals(WFUSE.decimals),
    chain: 'fuse',
    chainId: FUSE_CHAIN_ID,
  });
};
