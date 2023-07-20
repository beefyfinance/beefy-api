import { CELO_CHAIN_ID } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
import { sushiCeloClient } from '../../../apollo/client';

import pools from '../../../data/celo/sushiv2LpPools.json';
import { addressBook } from '../../../../packages/address-book/address-book';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';

const {
  celo: {
    platforms: {
      sushiCelo: { minichef, complexRewarderTimerv2 },
    },
    tokens: { SUSHIV2, CELO },
  },
} = addressBook;

export const getSushiCeloApys = () => {
  return getMiniChefApys({
    minichefConfig: {
      minichef,
      minichefAbi: SushiMiniChefV2,
      outputOracleId: SUSHIV2.symbol,
      tokenPerSecondContractMethodName: 'sushiPerSecond',
    },
    rewarderConfig: {
      rewarder: complexRewarderTimerv2,
      rewarderTokenOracleId: CELO.symbol,
      rewarderTotalAllocPoint: 10200,
    },
    pools,
    tradingClient: sushiCeloClient,
    chainId: CELO_CHAIN_ID,
  });
};
