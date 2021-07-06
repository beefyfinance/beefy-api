const getMasterChefApys = require('./getMaticMasterChefApys');
const {
  addressBook: {
    polygon: {
      tokens: { YELD },
      platforms: { polyyeld },
    },
  },
} = require('blockchain-addressbook');

const MasterChefAbi = require('../../../abis/matic/PolyyeldMasterChef.json');
const quickPools = require('../../../data/matic/polyyeldQuickLpPools.json');
const sushiPools = require('../../../data/matic/polyyeldSushiLpPools.json');
const apePools = require('../../../data/matic/polyyeldApeLpPools.json');
const { quickClient, sushiClient, apePolyClient } = require('../../../apollo/client');
const { QUICK_LPF, SUSHI_LPF, APEPOLY_LPF } = require('../../../constants');
const { getEDecimals } = require('../../../utils/getEDecimals');

const getPolyyeldApys = async () => {
  const quick = getMasterChefApys({
    masterchef: polyyeld.masterchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'YeldPerBlock',
    hasMultiplier: false,
    pools: quickPools,
    oracle: 'tokens',
    oracleId: YELD.symbol,
    decimals: getEDecimals(YELD.decimals),
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    // log: true,
  });

  const sushi = getMasterChefApys({
    masterchef: polyyeld.masterchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'YeldPerBlock',
    hasMultiplier: false,
    pools: sushiPools,
    oracle: 'tokens',
    oracleId: YELD.symbol,
    decimals: getEDecimals(YELD.decimals),
    tradingFeeInfoClient: sushiClient,
    liquidityProviderFee: SUSHI_LPF,
    // log: true,
  });

  const ape = getMasterChefApys({
    masterchef: polyyeld.masterchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'YeldPerBlock',
    hasMultiplier: false,
    pools: apePools,
    oracle: 'tokens',
    oracleId: YELD.symbol,
    decimals: getEDecimals(YELD.decimals),
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
      console.warn('getPolyyeldApys error', result.reason);
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

module.exports = { getPolyyeldApys };
