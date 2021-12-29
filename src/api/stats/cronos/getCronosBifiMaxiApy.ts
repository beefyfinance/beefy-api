const { cronosWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  cronos: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WCRO },
  },
} = addressBook;

export const getCronosBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WCRO.symbol,
    rewardDecimals: getEDecimals(WCRO.decimals),
    chain: 'cronos',
    web3: web3,
  });
};
