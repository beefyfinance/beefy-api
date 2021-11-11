const { celoWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  celo: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, CELO }
  },
} = addressBook;

export const getCeloBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: CELO.symbol,
    rewardDecimals: getEDecimals(CELO.decimals),
    chain: 'celo',
    web3: web3,
  });
};