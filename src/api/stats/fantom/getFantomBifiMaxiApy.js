import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { FANTOM_CHAIN_ID } from '../../../constants';
const {
  fantom: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI, WFTM },
  },
} = addressBook;

export const getFantomBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: oldBIFI.address,
    rewardPool: rewardPool,
    rewardId: WFTM.symbol,
    rewardDecimals: getEDecimals(WFTM.decimals),
    chain: 'fantom',
    chainId: FANTOM_CHAIN_ID,
  });
};
