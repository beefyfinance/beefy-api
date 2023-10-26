import { ETH_CHAIN_ID as chainId, SUSHI_LPF } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
// import { sushiPolyClient } from '../../../apollo/client';

import pools from '../../../data/ethereum/uniswapGammaLpPools.json';
import { addressBook } from '../../../../packages/address-book/address-book';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';
const {
  ethereum: {
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
      outputOracleId: 'RPL',
      tokenPerSecondContractMethodName: 'sushiPerSecond',
    },
    rewarderConfig: {
      rewarder: '0x84E5efD54461299eEe3a9a753760441055A4736B',
      rewarderTokenOracleId: 'RPL',
    },
    pools,
    quickGamma: 'https://wire2.gamma.xyz/hypervisors/allData',
    chainId: chainId,
    //log: true,
  });
};

module.exports = getGammaApys;
