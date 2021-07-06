const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/matic/BoneSwapMasterChef.json');
const quickPools = require('../../../data/matic/boneswapQuickLpPools.json');
const sushiPools = require('../../../data/matic/boneswapSushiLpPools.json');
const apePools = require('../../../data/matic/boneswapApeLpPools.json');
const { quickClient, sushiClient, apePolyClient } = require('../../../apollo/client');
const { QUICK_LPF, SUSHI_LPF, APEPOLY_LPF } = require('../../../constants');

const getBoneSwapApys = async () => {
  const chef = '0x0d17C30aFBD4d29EEF3639c7B1F009Fd6C9f1F72';

  const quick = getMasterChefApys({
    masterchef: chef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'BONE_PER_BLOCK',
    hasMultiplier: false,
    pools: quickPools,
    oracle: 'tokens',
    oracleId: 'BONEswap',
    decimals: '1e18',
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    // log: true,
  });

  const sushi = getMasterChefApys({
    masterchef: chef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'BONE_PER_BLOCK',
    hasMultiplier: false,
    pools: sushiPools,
    oracle: 'tokens',
    oracleId: 'BONEswap',
    decimals: '1e18',
    tradingFeeInfoClient: sushiClient,
    liquidityProviderFee: SUSHI_LPF,
    // log: true,
  });

  const ape = getMasterChefApys({
    masterchef: chef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'BONE_PER_BLOCK',
    hasMultiplier: false,
    pools: apePools,
    oracle: 'tokens',
    oracleId: 'BONEswap',
    decimals: '1e18',
    tradingFeeInfoClient: apePolyClient,
    liquidityProviderFee: APEPOLY_LPF,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  let promises = [quick, sushi, ape];
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getBoneSwap error', result.reason);
      continue;
    }

    // Set default APY values
    let mappedApyValues = result.value;
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

module.exports = { getBoneSwapApys };
