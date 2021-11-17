import { moonriverWeb3 } from '../../../utils/web3';
import { MOONRIVER_CHAIN_ID } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
import { sushiMoonriverClient } from '../../../apollo/client';

import pools from '../../../data/moonriver/sushiLpPools.json';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2.json';
import { AbiItem } from 'web3-utils';

import { addressBook } from '../../../../packages/address-book/address-book';
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
      minichefAbi: SushiMiniChefV2 as AbiItem[],
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
    web3: moonriverWeb3,
    chainId: MOONRIVER_CHAIN_ID,
  });
};
