import { celoWeb3 } from '../../../utils/web3';
import { CELO_CHAIN_ID } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
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

export const getSushiCeloApys = () => {
  return getMiniChefApys({
    minichefConfig: {
      minichef,
      outputOracleId: cSUSHI.symbol,
      tokenPerSecondContractMethodName: 'sushiPerSecond',
    },
    rewarderConfig: {
      rewarder: complexRewarderTime,
      rewarderTokenOracleId: CELO.symbol,
      rewarderTotalAllocPoint: 9600,
    },
    pools,
    tradingClient: sushiCeloClient,
    web3: celoWeb3,
    chainId: CELO_CHAIN_ID,
  });
};
