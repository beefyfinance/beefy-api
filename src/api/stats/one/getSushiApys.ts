import { ONE_CHAIN_ID } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
import { sushiOneClient } from '../../../apollo/client';

import pools from '../../../data/one/sushiLpPools.json';
import { addressBook } from '../../../../packages/address-book/address-book';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';

const {
  one: {
    platforms: {
      sushi: { minichef, complexRewarderTime },
    },
    tokens: { oneSUSHI, WONE },
  },
} = addressBook;

export const getSushiLpApys = () => {
  return getMiniChefApys({
    minichefConfig: {
      minichef,
      minichefAbi: SushiMiniChefV2,
      outputOracleId: oneSUSHI.symbol,
      tokenPerSecondContractMethodName: 'sushiPerSecond',
    },
    rewarderConfig: {
      rewarder: complexRewarderTime,
      rewarderTokenOracleId: WONE.symbol,
      rewarderTotalAllocPoint: 9600,
    },
    pools,
    tradingClient: sushiOneClient,
    chainId: ONE_CHAIN_ID,
  });
};
