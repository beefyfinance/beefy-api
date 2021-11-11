const { avaxWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  avax: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WAVAX }
  },
} = addressBook;

export const getAvaxBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WAVAX.symbol,
    rewardDecimals: getEDecimals(WAVAX.decimals),
    chain: 'avax',
    web3: web3,
  });
};