import { getEDecimals } from '../../../utils/getEDecimals';
import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { ETH_CHAIN_ID } from '../../../constants';
const {
  ethereum: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI, ETH: native },
  },
} = addressBook;

export const getEthereumBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: oldBIFI.address,
    rewardPool: rewardPool,
    rewardId: native.symbol,
    rewardDecimals: getEDecimals(native.decimals),
    chain: 'ethereum',
    chainId: ETH_CHAIN_ID,
  });
};
