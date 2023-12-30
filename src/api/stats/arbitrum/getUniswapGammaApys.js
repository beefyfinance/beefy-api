import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { getMiniChefApys } from '../common/getMiniChefApys';
import pools from '../../../data/arbitrum/uniswapGammaChefPools.json';
import pancakePools from '../../../data/arbitrum/pancakeGammaPools.json';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';
const merge = require('lodash/merge');
const minichef = '0x8A8fDe5D57725f070bFc55cd022B924e1c36C8a0';

export const getUniswapGammaApys = async () =>
  merge(
    await getMiniChefApys({
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
      // log: true,
    }),
    await getMiniChefApys({
      minichefConfig: {
        minichef: '0xC23b44e766435AaA712AaEBc299686385c428B9F',
        minichefAbi: SushiMiniChefV2,
        outputOracleId: 'ARB',
        tokenPerSecondContractMethodName: 'sushiPerSecond',
      },
      pools: pancakePools,
      quickGamma: 'https://wire2.gamma.xyz/pancakeswap/arbitrum/hypervisors/allData',
      chainId: chainId,
      // log: true,
    })
  );

module.exports = getUniswapGammaApys;
