const { fuseWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  fuse: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WFUSE }
  },
} = addressBook;

export const getFuseBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WFUSE.symbol,
    rewardDecimals: getEDecimals(WFUSE.decimals),
    chain: 'fuse',
    web3: web3,
  });
};