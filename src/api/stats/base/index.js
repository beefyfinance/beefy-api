const getBalancerBaseApys = require('./getBalancerApys');
const getBaseSwapApys = require('./getBaseSwapApys');
const getAlienBaseApys = require('./getAlienBaseApys');
const { getAerodromeApys } = require('./getAerodromeApys');
const { getCurveApys } = require('./getCurveApys');
const { getBaseCompoundV3Apys } = require('./getBaseCompoundV3Apys');
const getAuraBaseApys = require('./getAuraBaseApys');
const { getBeefyBaseCowApys } = require('./getBeefyBaseCowApys');
const { getMellowVeloApys } = require('../common/getMellowVeloApys');
const { getEquilibriaApys } = require('../common/getEquilibriaApys');
const { getPenpieApys } = require('./getPenpieApys');
const { getBesnARSApy } = require('./getBesnARSApy');
const { getTokemakApys } = require('./getTokemakApys');
const { getMorphoApys } = require('../common/morpho/getMorphoApys');
const { getTrueApys } = require('./getTrueApys');
const { BASE_CHAIN_ID } = require('../../../constants');

const getApys = [
  getTrueApys,
  getTokemakApys,
  getBesnARSApy,
  getAerodromeApys,
  getCurveApys,
  getBalancerBaseApys,
  getBaseSwapApys,
  getAlienBaseApys,
  getBaseCompoundV3Apys,
  getAuraBaseApys,
  () => getMellowVeloApys(BASE_CHAIN_ID, require('../../../data/base/mellowAeroPools.json')),
  () => getMorphoApys(BASE_CHAIN_ID, require('../../../data/base/morphoPools.json')),
  () => getEquilibriaApys(require('../../../data/base/pendlePools.json')),
  getPenpieApys,
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
