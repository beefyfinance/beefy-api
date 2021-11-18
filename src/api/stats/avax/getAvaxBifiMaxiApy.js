const { avaxWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
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
    rewardId: AVAX.symbol,
    rewardDecimals: getEDecimals(AVAX.decimals),
    chain: 'avax',
    web3: web3,
  });
};
