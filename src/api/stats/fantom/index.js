const getSpookyV2LpApys = require('./getSpookyV2LpApys');
const getSpookyV3LpApys = require('./getSpookyV3LpApys');
const getSpiritApys = require('./getSpiritApys');
const getGeistLpApys = require('./getGeistLpApys');
const getBeethovenxApys = require('./getBeethovenxApys');
const getBeethovenxDualApys = require('./getBeethovenxDualApys');
const getWigoApys = require('./getWigoApys');
const getEqualizerApys = require('./getEqualizerApys');
const getFvmApys = require('./getFvmApys');

const getApys = [
  getFvmApys,
  getEqualizerApys,
  getSpookyV2LpApys,
  getSpookyV3LpApys,
  getSpiritApys,
  getGeistLpApys,
  getBeethovenxApys,
  getBeethovenxDualApys,
  getWigoApys,
];

const getFantomApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getFantomApys error', result.reason);
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
  console.log(`> [APY] Fantom finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getFantomApys };
