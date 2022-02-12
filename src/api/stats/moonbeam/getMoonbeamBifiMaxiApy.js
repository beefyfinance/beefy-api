const { moonbeamWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  moonbeam: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WGLMR }
  },
} = addressBook;

export const getMoonbeamBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WGLMR.symbol,
    rewardDecimals: getEDecimals(WGLMR.decimals),
    chain: 'moonbeam',
    web3: web3,
  });
};