const { auroraWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  aurora: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WETH }
  },
} = addressBook;

export const getAuroraBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WETH.symbol,
    rewardDecimals: getEDecimals(WETH.decimals),
    chain: 'aurora',
    web3: web3,
  });
};