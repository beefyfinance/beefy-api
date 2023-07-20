import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { CELO_CHAIN_ID } from '../../../constants';
const {
  celo: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, CELO },
  },
} = addressBook;

export const getCeloBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: CELO.symbol,
    rewardDecimals: getEDecimals(CELO.decimals),
    chain: 'celo',
    chainId: CELO_CHAIN_ID,
  });
};
