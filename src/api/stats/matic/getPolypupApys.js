const getMasterChefApys = require('./getMaticMasterChefApys');
const {
  addressBook: {
    polygon: {
      tokens: { BONE },
      platforms: { polypupBone },
    },
  },
} = require('blockchain-addressbook');

const { QUICK_LPF } = require('../../../constants');
const MasterChefAbi = require('../../../abis/matic/PolypupBoneMasterChef.json');
const pools = require('../../../data/matic/polypupLpPools.json');
const singlePools = require('../../../data/matic/polypupSinglePools.json');
const { quickClient } = require('../../../apollo/client');
const { getEDecimals } = require('../../../utils/getEDecimals');

const getPolypupApys = async () => {
  const all = getMasterChefApys({
    masterchef: polypupBone.masterchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'BonePerBlock',
    hasMultiplier: false,
    singlePools: singlePools,
    pools: pools,
    oracle: 'tokens',
    oracleId: BONE.symbol,
    decimals: getEDecimals(BONE.decimals),
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
      console.warn('getPolypupApys error', result.reason);
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

module.exports = { getPolypupApys };
