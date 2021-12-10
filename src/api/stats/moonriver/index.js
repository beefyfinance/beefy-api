const { getSolarbeamLpApys } = require('./getSolarbeamLpApys');
const { getSolarbeamDualLpApys } = require('./getSolarbeamDualLpApys');
const { getSolarbeamDualLpV2Apys } = require('./getSolarbeamDualLpV2Apys');
const { getSolarApy } = require('./getSolarApy');
const { getSushiLpApys } = require('./getSushiLpApys');
const { getMovrBifiGovApy } = require('./getMovrBifiGovApy');
const { getMovrBifiMaxiApy } = require('./getMovrBifiMaxiApy');
const { getFinnLpApys } = require('./getFinnLpApys');
const getFinnApy = require('./getFinnApy');

const getApys = [
  getSolarbeamLpApys,
  getSolarbeamDualLpApys,
  getSolarbeamDualLpV2Apys,
  getSolarApy,
  getSushiLpApys,
  getMovrBifiGovApy,
  getMovrBifiMaxiApy,
  getFinnLpApys,
  getFinnApy,
  ];

const getMoonriverApys = async () => {
  let apys = {};
  let apyBreakdowns = {};
  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getMoonriverApys error', result.reason);
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

module.exports = { getMoonriverApys };
