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
const pools = require('../../../data/matic/polyyeldLpPools.json');
const { quickClient } = require('../../../apollo/client');
const { quickLiquidityProviderFee } = require('./getQuickLpApys');
const { getEDecimals } = require('../../../utils/getEDecimals');

const getPolyyeldApys = async () => {
  const lps = getMasterChefApys({
    masterchef: polyyeld.masterchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'YeldPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracle: 'tokens',
    oracleId: YELD.symbol,
    decimals: getEDecimals(YELD.decimals),
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: quickLiquidityProviderFee,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  let promises = [lps];
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
