import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { HECO_CHAIN_ID } from '../../../constants';
const {
  heco: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WHT },
  },
} = addressBook;

export const getHecoBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WHT.symbol,
    rewardDecimals: getEDecimals(WHT.decimals),
    chain: 'heco',
    chainId: HECO_CHAIN_ID,
  });
};
