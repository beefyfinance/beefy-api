import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { MOONRIVER_CHAIN_ID } from '../../../constants';
const {
  moonriver: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WMOVR },
  },
} = addressBook;

export const getMovrBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WMOVR.symbol,
    rewardDecimals: getEDecimals(WMOVR.decimals),
    chain: 'movr',
    chainId: MOONRIVER_CHAIN_ID,
  });
};
