const getBalancerBaseApys = require('./getBalancerApys');
const getBaseSwapApys = require('./getBaseSwapApys');
const getStargateBaseApys = require('./getStargateBaseApys');
const getBvmApys = require('./getBvmApys');
const getAlienBaseApys = require('./getAlienBaseApys');
const getMoonwellBaseApys = require('./getMoonwellBaseApys');
const { getSwapBasedApys } = require('./getSwapBasedApys');
const getBasoApys = require('./getBasoApys');
const { getAerodromeApys } = require('./getAerodromeApys');
const { getCurveApys } = require('./getCurveApys');
const getEqualizerApys = require('./getEqualizerApys');
const getBaseMerklGammaApys = require('./getMerklBaseApys');
const { getBaseCompoundV3Apys } = require('./getBaseCompoundV3Apys');
const getAuraBaseApys = require('./getAuraBaseApys');
const { getSonneApys } = require('./getSonneApys');
const { getSeamlessApys } = require('./getSeamlessApys');
const { getBeefyBaseCowApys } = require('./getBeefyBaseCowApys');

const getApys = [
  getSeamlessApys,
  getSonneApys,
  getAerodromeApys,
  getCurveApys,
  getBalancerBaseApys,
  getBaseSwapApys,
  getStargateBaseApys,
  getBvmApys,
  getAlienBaseApys,
  getMoonwellBaseApys,
  getSwapBasedApys,
  getBasoApys,
  getEqualizerApys,
  getBaseMerklGammaApys,
  getBaseCompoundV3Apys,
  getAuraBaseApys,
  getBeefyBaseCowApys,
];

const getBaseApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getBaseApys error', result.reason);
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

  const end = Date.now();
  console.log(`> [APY] Base finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getBaseApys };
