import { OPTIMISM_CHAIN_ID as chainId, SUSHI_LPF } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
// import { sushiPolyClient } from '../../../apollo/client';

import pools from '../../../data/optimism/uniswapGammaLpPools.json';
import merklGammaPools from '../../../data/optimism/merklGammaLpPools.json';
import { addressBook } from '../../../../packages/address-book/address-book';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';
import BigNumber from 'bignumber.js';
import { getApyBreakdown } from '../common/getApyBreakdown';
import { merge } from 'lodash';

const {
  optimism: {
    platforms: {
      gamma: { minichef },
    },
  },
} = addressBook;

const merklApi = 'https://api.angle.money/v1/merkl?chainId=10';
const gammaApi = 'https://wire2.gamma.xyz/optimism/hypervisors/allData';

export const getGammaApys = async () =>
  merge(
    await getMiniChefApys({
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
    }),
    await getMerklGammaApys()
  );

const getMerklGammaApys = async () => {
  let poolAprs = {};
  try {
    poolAprs = await fetch(merklApi).then(res => res.json());
  } catch (e) {
    console.error(`Failed to fetch Merkl APRs: ${chainId}`);
  }

  let aprs = [];
  for (let i = 0; i < merklGammaPools.length; ++i) {
    let apr = BigNumber(0);
    let merklPools = poolAprs[chainId].pools;
    if (Object.keys(merklPools).length !== 0) {
      for (const [key, value] of Object.entries(merklPools)) {
        if (key.toLowerCase() === merklGammaPools[i].pool.toLowerCase()) {
          for (const [k, v] of Object.entries(value.alm)) {
            if (k.toLowerCase() === merklGammaPools[i].address.toLowerCase()) {
              apr = BigNumber(v.almAPR).dividedBy(100);
            }
          }
        }
      }
    }

    aprs.push(apr);
  }

  let tradingAprs = {};
  try {
    const response = await fetch(gammaApi).then(res => res.json());

    // Combine the two responses
    // Object.assign(response, sushiReponse);

    merklGammaPools.forEach(p => {
      tradingAprs[p.address.toLowerCase()] = new BigNumber(
        response[p.address.toLowerCase()].returns.daily.feeApr
      );
    });
  } catch (e) {
    console.log('OP Gamma Api Error', e);
  }

  return await getApyBreakdown(merklGammaPools, tradingAprs, aprs, 0);
};

module.exports = getGammaApys;
