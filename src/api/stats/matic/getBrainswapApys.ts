import getMasterChefApys from './getMaticMasterChefApys';
import { addressBook } from 'blockchain-addressbook';

import { QUICK_LPF } from '../../../constants';
import MasterChefAbi from '../../../abis/matic/BrainswapMasterChef.json';
import pools from '../../../data/matic/brainswapPools.json';
import { quickClient } from '../../../apollo/client';
import { getEDecimals } from '../../../utils/getEDecimals';
const {
  polygon: {
    tokens: { BRAIN },
    platforms: { brainswap },
  },
} = addressBook;

export const getBrainswapApys = async () => {
  const all = getMasterChefApys({
    masterchef: brainswap.masterchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'brainPerBlock',
    hasMultiplier: true,
    singlePools: [],
    pools: pools,
    oracle: 'tokens',
    oracleId: BRAIN.symbol,
    decimals: getEDecimals(BRAIN.decimals),
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  let promises = [all];
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getBrainswapApys error', result.reason);
      continue;
    }

    // Set default APY values
    let mappedApyValues: any = result.value;
    let mappedApyBreakdownValues = {};

    // Loop through key values and move default breakdown format
    // To require totalApy key
    for (const [key, value] of Object.entries(result.value)) {
      mappedApyBreakdownValues[key] = {
        totalApy: value,
      };
    }

    // Break out to apy and breakdowns if possible
    let hasApyBreakdowns = 'apyBreakdowns' in result.value;
    if (hasApyBreakdowns) {
      mappedApyValues = result.value.apys;
      mappedApyBreakdownValues = result.value.apyBreakdowns;
    }

    apys = { ...apys, ...mappedApyValues };

    apyBreakdowns = { ...apyBreakdowns, ...mappedApyBreakdownValues };
  }

  return {
    apys,
    apyBreakdowns,
  };
};
