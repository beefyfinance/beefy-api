import { zkevmWeb3 as web3 } from '../../../utils/web3';
import { ZKEVM_CHAIN_ID as chainId } from '../../../constants';
import { getMiniChefApys } from '../common/getMiniChefApys';
import pools from '../../../data/zkevm/quickGammaLpPools.json';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2.json';

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  zkevm: {
    platforms: {
      quickswap: { minichef },
    },
  },
} = addressBook;

export const getQuickGammaApys = () => {
  return getMiniChefApys({
    minichefConfig: {
      minichef,
      minichefAbi: SushiMiniChefV2,
      outputOracleId: 'QUICK',
      tokenPerSecondContractMethodName: 'sushiPerSecond',
    },
    rewarderConfig: {
      rewarder: '0x96871A05aF1b05D8C51e13633FA8215b2C73ffd8',
      rewarderTokenOracleId: 'QUICK',
    },
    pools,
    quickGamma: 'https://wire2.gamma.xyz/quickswap/polygon-zkevm/hypervisors/allData',
    web3: web3,
    chainId: chainId,
  });
};
