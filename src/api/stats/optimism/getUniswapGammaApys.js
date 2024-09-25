import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants';
import { getMiniChefApys } from '../common/getMiniChefApys';
import pools from '../../../data/optimism/uniswapGammaLpPools.json';
import merklGammaPools from '../../../data/optimism/merklGammaLpPools.json';
import { addressBook, ChainId } from '../../../../packages/address-book/src/address-book';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';
import BigNumber from 'bignumber.js';
import { getApyBreakdown } from '../common/getApyBreakdown';
import { merge } from 'lodash';
import { getMerklAprs } from '../common/getMerklAprs';

const {
  optimism: {
    platforms: {
      gamma: { minichef },
    },
  },
} = addressBook;

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
  const merklAprs = await getMerklAprs(ChainId.optimism, pools);

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

  return await getApyBreakdown(merklGammaPools, tradingAprs, merklAprs, 0);
};

module.exports = getGammaApys;
