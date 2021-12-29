import { celoWeb3 } from '../../../utils/web3';
import { CELO_CHAIN_ID } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
import { sushiCeloClient } from '../../../apollo/client';

import pools from '../../../data/celo/sushiv2LpPools.json';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2.json';
import { AbiItem } from 'web3-utils';

import { addressBook } from '../../../../packages/address-book/address-book';
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
      minichefAbi: SushiMiniChefV2 as AbiItem[],
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
    web3: celoWeb3,
    chainId: CELO_CHAIN_ID,
  });
};
