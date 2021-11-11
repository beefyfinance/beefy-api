const { polygonWeb3: web3 } = require('../../../utils/web3');
import { getEDecimals } from '../../../utils/getEDecimals';

import { getBifiMaxiApys } from '../common/getBifiMaxiApys';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  polygon: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI, WMATIC }
  },
} = addressBook;

export const getPolygonBifiMaxiApy = () => {
  return getBifiMaxiApys({
    bifi: BIFI.address,
    rewardPool: rewardPool,
    rewardId: WMATIC.symbol,
    rewardDecimals: getEDecimals(WMATIC.decimals),
    chain: 'polygon',
    web3: web3,
  });
};