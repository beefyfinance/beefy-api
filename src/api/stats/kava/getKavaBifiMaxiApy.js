import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { KAVA_CHAIN_ID } from '../../../constants';
const {
  kava: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI, KAVA: native },
  },
} = addressBook;

export const getKavaBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: oldBIFI.address,
    rewardPool: rewardPool,
    rewardId: native.symbol,
    rewardDecimals: getEDecimals(native.decimals),
    chain: 'kava',
    chainId: KAVA_CHAIN_ID,
  });
};
