import { oneWeb3 } from '../../../utils/web3';
import { ONE_CHAIN_ID } from '../../../constants';

import { getSushiApys } from '../common/getSushiApys';
import { sushiOneClient } from '../../../apollo/client';

import pools from '../../../data/one/sushiLpPools.json';

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  one: {
    platforms: {
      sushi: { minichef, complexRewarderTime },
    },
    tokens: { oneSUSHI, WONE },
  },
} = addressBook;

export const getSushiLpApys = () => {
  return getSushiApys({
    minichef,
    complexRewarderTime,
    sushiOracleId: oneSUSHI.symbol,
    nativeOracleId: WONE.symbol,
    nativeTotalAllocPoint: 9600,
    pools,
    sushiClient: sushiOneClient,
    web3: oneWeb3,
    chainId: ONE_CHAIN_ID,
  });
};
