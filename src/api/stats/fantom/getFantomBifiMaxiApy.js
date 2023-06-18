import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { FANTOM_CHAIN_ID } from '../../../constants';
const {
  fantom: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WFTM },
  },
} = addressBook;

export const getFantomBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WFTM.symbol,
    rewardDecimals: getEDecimals(WFTM.decimals),
    chain: 'fantom',
    chainId: FANTOM_CHAIN_ID,
  });
};
