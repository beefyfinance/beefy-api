import { MOONBEAM_CHAIN_ID as chainId } from '../../../constants';
import { getMiniChefApys } from '../common/getMiniChefApys';
import beamswapPools from '../../../data/moonbeam/beamswapGammaPools.json';
import stellaPools from '../../../data/moonbeam/stellaGammaPools.json';
import uniswapPools from '../../../data/moonbeam/uniswapGammaPools.json';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';
import { merge } from 'lodash';

export const getGammaChefApys = async () =>
  merge(
    merge(
      await getMiniChefApys({
        minichefConfig: {
          minichef: '0x451F2D96bCAE518Af150e6b7443D21201847c3a0',
          minichefAbi: SushiMiniChefV2,
          outputOracleId: 'GLMR',
          tokenPerSecondContractMethodName: 'sushiPerSecond',
        },
        rewarderConfig: {
          rewarder: '0x6c509511672f3cDC0440C219169e4367425870a8',
          rewarderTokenOracleId: 'GLMR',
        },
        pools: beamswapPools,
        quickGamma: 'https://wire2.gamma.xyz/beamswap/moonbeam/hypervisors/allData',
        chainId: chainId,
        // log: true,
      }),
      await getMiniChefApys({
        minichefConfig: {
          minichef: '0x97840Df3944445C684C3977eaa0890AA29D71f73',
          minichefAbi: SushiMiniChefV2,
          outputOracleId: 'GLMR',
          tokenPerSecondContractMethodName: 'sushiPerSecond',
        },
        rewarderConfig: {
          rewarder: '0x06895D6f6680E5e8301604D5E0483A3655C547B8',
          rewarderTokenOracleId: 'GLMR',
        },
        pools: stellaPools,
        quickGamma: 'https://wire2.gamma.xyz/stellaswap/moonbeam/hypervisors/allData',
        chainId: chainId,
        // log: true,
      })
    ),
    await getMiniChefApys({
      minichefConfig: {
        minichef: '0xD5F4877263b736625ba363385983C2D02B41F35b',
        minichefAbi: SushiMiniChefV2,
        outputOracleId: 'GLMR',
        tokenPerSecondContractMethodName: 'sushiPerSecond',
      },
      rewarderConfig: {
        rewarder: '0x59822e319A34e62E2AB912c8dc7aA4458d81f51a',
        rewarderTokenOracleId: 'GLMR',
      },
      pools: uniswapPools,
      quickGamma: 'https://wire2.gamma.xyz/moonbeam/hypervisors/allData',
      chainId: chainId,
      // log: true,
    })
  );

module.exports = getGammaChefApys;
