import { FUSE_CHAIN_ID } from '../../../constants';
import { getMiniChefApys } from '../common/getMiniChefApys';
import { sushiFuseClient } from '../../../apollo/client';
import pools from '../../../data/fuse/sushiFuseLpPools.json';
import { addressBook } from '../../../../packages/address-book/address-book';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';

const {
  fuse: {
    platforms: {
      sushiFuse: { minichef, complexRewarderTime },
    },
    tokens: { SUSHI, FUSE },
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
      rewarderTokenOracleId: FUSE.symbol,
      rewarderTotalAllocPoint: 10000,
    },
    pools,
    tradingClient: sushiFuseClient,
    chainId: FUSE_CHAIN_ID,
  });
};
