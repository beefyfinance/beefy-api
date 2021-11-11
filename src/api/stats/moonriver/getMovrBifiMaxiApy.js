const { moonriverWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  moonriver: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WMOVR }
  },
} = addressBook;

export const getMovrBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WMOVR.symbol,
    rewardDecimals: getEDecimals(WMOVR.decimals),
    chain: 'movr',
    web3: web3,
  });
};