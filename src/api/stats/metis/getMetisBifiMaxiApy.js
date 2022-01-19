const { metisWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  metis: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, METIS },
  },
} = addressBook;

export const getMetisBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: 'METIS',
    rewardDecimals: getEDecimals(METIS.decimals),
    chain: 'metis',
    web3: web3,
  });
};
