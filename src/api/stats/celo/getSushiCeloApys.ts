import { celoWeb3 } from '../../../utils/web3';
import { CELO_CHAIN_ID } from '../../../constants';

import { getSushiApys } from '../common/getSushiApys';
import { sushiCeloClient } from '../../../apollo/client';

import pools from '../../../data/celo/sushiLpPools.json';

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  celo: {
    platforms: {
      sushiCelo: { minichef, complexRewarderTime },
    },
    tokens: { cSUSHI, CELO },
  },
} = addressBook;

export const getSushiLpApys = () => {
  return getSushiApys({
    minichef,
    complexRewarderTime,
    sushiOracleId: cSUSHI.symbol,
    nativeOracleId: CELO.symbol,
    nativeTotalAllocPoint: 9600,
    pools,
    sushiClient: sushiCeloClient,
    web3: celoWeb3,
    chainId: CELO_CHAIN_ID,
  });
};
