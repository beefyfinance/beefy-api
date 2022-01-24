import { fantomWeb3 } from '../../../utils/web3';
import { FANTOM_CHAIN_ID } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
import { sushiFantomClient } from '../../../apollo/client';

import pools from '../../../data/fantom/sushiFtmLpPools.json';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2.json';
import { AbiItem } from 'web3-utils';

import { addressBook } from '../../../../packages/address-book/address-book';
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
      minichefAbi: SushiMiniChefV2 as AbiItem[],
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
    web3: fantomWeb3,
    chainId: FANTOM_CHAIN_ID,
  });
};
