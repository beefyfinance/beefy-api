import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { getMiniChefApys } from '../common/getMiniChefApys';
import pools from '../../../data/arbitrum/uniswapGammaChefPools.json';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';
const minichef = '0x8A8fDe5D57725f070bFc55cd022B924e1c36C8a0';

export const getUniswapGammaApys = () => {
  return getMiniChefApys({
    minichefConfig: {
      minichef,
      minichefAbi: SushiMiniChefV2,
      outputOracleId: 'ARB',
      tokenPerSecondContractMethodName: 'sushiPerSecond',
    },
    rewarderConfig: {
      rewarder: '0x6be9b5925C9F5833493aE6E7fFb3a0d745f0F235',
      rewarderTokenOracleId: 'ARB',
    },
    pools,
    quickGamma: 'https://wire2.gamma.xyz/arbitrum/hypervisors/allData',
    chainId: chainId,
    //log: true,
  });
};

module.exports = getUniswapGammaApys;
