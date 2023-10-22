import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { MOONBEAM_CHAIN_ID } from '../../../constants';
const {
  moonbeam: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI, WGLMR },
  },
} = addressBook;

export const getMoonbeamBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: oldBIFI.address,
    rewardPool: rewardPool,
    rewardId: WGLMR.symbol,
    rewardDecimals: getEDecimals(WGLMR.decimals),
    chain: 'moonbeam',
    chainId: MOONBEAM_CHAIN_ID,
  });
};
