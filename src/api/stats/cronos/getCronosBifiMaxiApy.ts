import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { CRONOS_CHAIN_ID } from '../../../constants';
const {
  cronos: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WCRO },
  },
} = addressBook;

export const getCronosBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WCRO.symbol,
    rewardDecimals: getEDecimals(WCRO.decimals),
    chain: 'cronos',
    chainId: CRONOS_CHAIN_ID,
  });
};
