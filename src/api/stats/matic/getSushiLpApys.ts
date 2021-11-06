import { polygonWeb3 as web3 } from '../../../utils/web3';
import { POLYGON_CHAIN_ID } from '../../../constants';

import { getSushiApys } from '../common/getSushiApys';
import { sushiClient } from '../../../apollo/client';

import pools from '../../../data/matic/sushiLpPools.json';

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  polygon: {
    platforms: {
      sushi: { minichef, complexRewarderTime },
    },
  },
} = addressBook;

export const getSushiLpApys = () => {
  return getSushiApys({
    minichef,
    complexRewarderTime,
    nativeOracleId: 'WMATIC',
    nativeTotalAllocPoint: 1000,
    pools,
    sushiClient,
    web3,
    chainId: POLYGON_CHAIN_ID,
  });
};
