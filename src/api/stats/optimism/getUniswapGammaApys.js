import { OPTIMISM_CHAIN_ID as chainId, SUSHI_LPF } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
// import { sushiPolyClient } from '../../../apollo/client';

import pools from '../../../data/optimism/uniswapGammaLpPools.json';
import { addressBook } from '../../../../packages/address-book/address-book';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';
const {
  optimism: {
    platforms: {
      gamma: { minichef },
    },
  },
} = addressBook;

export const getGammaApys = () => {
  return getMiniChefApys({
    minichefConfig: {
      minichef,
      minichefAbi: SushiMiniChefV2,
      outputOracleId: 'OP',
      tokenPerSecondContractMethodName: 'sushiPerSecond',
    },
    rewarderConfig: {
      rewarder: '0xB24DC81f8Be7284C76C7cF865b803807B3C2EF55',
      rewarderTokenOracleId: 'OP',
    },
    pools,
    quickGamma: 'https://wire2.gamma.xyz/optimism/hypervisors/allData',
    chainId: chainId,
    // log: true,
  });
};

module.exports = getGammaApys;
