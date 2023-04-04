const { ethereumWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  ethereum: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, ETH: native },
  },
} = addressBook;

export const getEthereumBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: native.symbol,
    rewardDecimals: getEDecimals(native.decimals),
    chain: 'ethereum',
    web3: web3,
  });
};
