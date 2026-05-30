const getAlienBaseApys = require('./getAlienBaseApys');
const { getAerodromeApys } = require('./getAerodromeApys');
const { getCurveApys } = require('./getCurveApys');
const { getBeefyBaseCowApys } = require('./getBeefyBaseCowApys');
const { getAaveV3Apys } = require('./getAaveV3Apys');
const { getMellowVeloApys } = require('../common/getMellowVeloApys');
const { getMorphoApys } = require('../common/morpho/getMorphoApys');
const { BASE_CHAIN_ID } = require('../../../constants');

const getApys = [
  getAaveV3Apys,
  getAerodromeApys,
  getCurveApys,
  getAlienBaseApys,
  () => getMellowVeloApys(BASE_CHAIN_ID, require('../../../data/base/mellowAeroPools.json')),
  () => getMorphoApys(BASE_CHAIN_ID, require('../../../data/base/morphoPools.json')),
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
