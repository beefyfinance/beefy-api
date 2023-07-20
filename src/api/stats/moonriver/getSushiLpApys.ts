import { MOONRIVER_CHAIN_ID } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
import { sushiMoonriverClient } from '../../../apollo/client';

import pools from '../../../data/moonriver/sushiLpPools.json';

import { addressBook } from '../../../../packages/address-book/address-book';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';
const {
  moonriver: {
    platforms: {
      sushi: { minichef, complexRewarderTime },
    },
    tokens: { mSUSHI, WMOVR },
  },
} = addressBook;

export const getSushiLpApys = () => {
  return getMiniChefApys({
    minichefConfig: {
      minichef,
      minichefAbi: SushiMiniChefV2,
      outputOracleId: mSUSHI.symbol,
      tokenPerSecondContractMethodName: 'sushiPerSecond',
    },
    rewarderConfig: {
      rewarder: complexRewarderTime,
      rewarderTokenOracleId: WMOVR.symbol,
      rewarderTotalAllocPoint: 10000,
    },
    pools,
    tradingClient: sushiMoonriverClient,
    chainId: MOONRIVER_CHAIN_ID,
  });
};
