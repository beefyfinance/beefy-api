const { kavaWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  kava: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, KAVA: native },
  },
} = addressBook;

export const getKavaBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: native.symbol,
    rewardDecimals: getEDecimals(native.decimals),
    chain: 'kava',
    web3: web3,
  });
};
