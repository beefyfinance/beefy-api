const { oneWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  one: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WONE }
  },
} = addressBook;

export const getOneBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WONE.symbol,
    rewardDecimals: getEDecimals(WONE.decimals),
    chain: 'one',
    web3: web3,
  });
};