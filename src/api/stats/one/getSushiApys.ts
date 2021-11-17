import { oneWeb3 } from '../../../utils/web3';
import { ONE_CHAIN_ID } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
import { sushiOneClient } from '../../../apollo/client';

import pools from '../../../data/one/sushiLpPools.json';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2.json';
import { AbiItem } from 'web3-utils';

import { addressBook } from '../../../../packages/address-book/address-book';
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
      minichefAbi: SushiMiniChefV2 as AbiItem[],
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
    web3: oneWeb3,
    chainId: ONE_CHAIN_ID,
  });
};
