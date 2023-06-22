import { FANTOM_CHAIN_ID } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
import { sushiFantomClient } from '../../../apollo/client';

import pools from '../../../data/fantom/sushiFtmLpPools.json';
import { addressBook } from '../../../../packages/address-book/address-book';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';

const {
  fantom: {
    platforms: {
      sushiFtm: { minichef, complexRewarderTime },
    },
    tokens: { SUSHI, WFTM },
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
      rewarderTokenOracleId: WFTM.symbol,
      rewarderTotalAllocPoint: 10000,
    },
    pools,
    tradingClient: sushiFantomClient,
    chainId: FANTOM_CHAIN_ID,
  });
};
