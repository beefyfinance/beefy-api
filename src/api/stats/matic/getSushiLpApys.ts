import { POLYGON_CHAIN_ID, SUSHI_LPF } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
import { sushiPolyClient } from '../../../apollo/client';

import pools from '../../../data/matic/sushiLpPools.json';

import { addressBook } from '../../../../packages/address-book/address-book';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';
const {
  polygon: {
    platforms: {
      sushi: { minichef, complexRewarderTime },
    },
    tokens: { SUSHI, WMATIC },
  },
} = addressBook;

export const getSushiLpApys = () => {
  return getMiniChefApys({
    minichefConfig: {
      minichef,
      minichefAbi: SushiMiniChefV2,
      outputOracleId: SUSHI.symbol,
      tokenPerSecondContractMethodName: 'sushiPerSecond',
    },
    rewarderConfig: {
      rewarder: complexRewarderTime,
      rewarderTokenOracleId: WMATIC.symbol,
      rewarderTotalAllocPoint: 1028,
    },
    pools,
    tradingClient: sushiPolyClient,
    chainId: POLYGON_CHAIN_ID,
  });
};
