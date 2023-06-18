import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { CANTO_CHAIN_ID } from '../../../constants';
const {
  canto: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, CANTO: native },
  },
} = addressBook;

export const getCantoBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: native.symbol,
    rewardDecimals: getEDecimals(native.decimals),
    chain: 'canto',
    chainId: CANTO_CHAIN_ID,
  });
};
