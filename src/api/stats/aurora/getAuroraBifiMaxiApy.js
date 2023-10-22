import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { AURORA_CHAIN_ID } from '../../../constants';

const {
  aurora: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI, WETH },
  },
} = addressBook;

export const getAuroraBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: oldBIFI.address,
    rewardPool: rewardPool,
    rewardId: WETH.symbol,
    rewardDecimals: getEDecimals(WETH.decimals),
    chain: 'aurora',
    chainId: AURORA_CHAIN_ID,
  });
};
