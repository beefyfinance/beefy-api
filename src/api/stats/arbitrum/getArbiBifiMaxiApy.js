const { arbitrumWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  arbitrum: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, ETH }
  },
} = addressBook;

export const getArbiBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: ETH.symbol,
    rewardDecimals: getEDecimals(ETH.decimals),
    chain: 'arbi',
    web3: web3,
  });
};