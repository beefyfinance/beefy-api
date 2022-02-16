import { polygonWeb3 } from '../../../utils/web3';
import { POLYGON_CHAIN_ID, SUSHI_LPF } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
import { sushiPolyClient } from '../../../apollo/client';

import pools from '../../../data/matic/sushiLpPools.json';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2.json';
import { AbiItem } from 'web3-utils';

import { addressBook } from '../../../../packages/address-book/address-book';
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
      minichefAbi: SushiMiniChefV2 as AbiItem[],
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
    web3: polygonWeb3,
    chainId: POLYGON_CHAIN_ID,
  });
};
