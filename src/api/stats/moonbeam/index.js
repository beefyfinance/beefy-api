const getMoonbeamBifiGovApy = require('./getMoonbeamBifiGovApy');
const getBeamswapApys = require('./getBeamswapApys');
const { getStellaswapApys } = require('./getStellaswapApys');
const { getMoonbeamBifiMaxiApy } = require('./getMoonbeamBifiMaxiApy');
const { getSolarFlareApys } = require('./getSolarFlareApys');
const getxStellaApy = require('./getxStellaApy');

const getApys = [
  getBeamswapApys,
  getStellaswapApys,
  getMoonbeamBifiGovApy,
  getMoonbeamBifiMaxiApy,
  getSolarFlareApys,
  getxStellaApy,
];

const getMoonbeamApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getMoonbeamApys error', result.reason);
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

module.exports = { getMoonbeamApys };
