const { fantomWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  fantom: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WFTM }
  },
} = addressBook;

export const getFantomBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WFTM.symbol,
    rewardDecimals: getEDecimals(WFTM.decimals),
    chain: 'fantom',
    web3: web3,
  });
};