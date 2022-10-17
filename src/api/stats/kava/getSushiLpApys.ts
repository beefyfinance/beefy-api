import { kavaWeb3 } from '../../../utils/web3';
import { KAVA_CHAIN_ID } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
import { sushiKavaClient } from '../../../apollo/client';

import pools from '../../../data/kava/sushiKavaLpPools.json';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2.json';
import { AbiItem } from 'web3-utils';

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  kava: {
    platforms: {
      sushiKava: { minichef, complexRewarderTime },
    },
    tokens: { SUSHI, KAVA },
  },
} = addressBook;

export const getSushiLpApys = () => {
  return getMiniChefApys({
    minichefConfig: {
      minichef,
      minichefAbi: SushiMiniChefV2 as AbiItem[],
      outputOracleId: SUSHI.symbol,
      tokenPerSecondContractMethodName: 'sushiPerSecond',
    },
    rewarderConfig: {
      rewarder: complexRewarderTime,
      rewarderTokenOracleId: KAVA.symbol,
      rewarderTotalAllocPoint: 1000,
    },
    pools,
    tradingClient: sushiKavaClient,
    web3: kavaWeb3,
    chainId: KAVA_CHAIN_ID,
    log: true,
  });
};
