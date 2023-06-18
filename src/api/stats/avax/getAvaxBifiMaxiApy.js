import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { AVAX_CHAIN_ID } from '../../../constants';
const {
  avax: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, AVAX },
  },
} = addressBook;

export const getAvaxBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: 'AVAX',
    rewardDecimals: getEDecimals(AVAX.decimals),
    chain: 'avax',
    chainId: AVAX_CHAIN_ID,
  });
};
