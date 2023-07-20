import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { ONE_CHAIN_ID } from '../../../constants';
const {
  one: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WONE },
  },
} = addressBook;

export const getOneBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WONE.symbol,
    rewardDecimals: getEDecimals(WONE.decimals),
    chain: 'one',
    chainId: ONE_CHAIN_ID,
  });
};
