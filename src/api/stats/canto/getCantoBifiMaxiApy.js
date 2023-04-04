const { cantoWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  canto: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, CANTO: native },
  },
} = addressBook;

export const getCantoBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: native.symbol,
    rewardDecimals: getEDecimals(native.decimals),
    chain: 'canto',
    web3: web3,
  });
};
