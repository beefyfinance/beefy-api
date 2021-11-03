const getSpookyLpApys = require('./getSpookyLpApys');
const getFroyoLpApys = require('./getFroyoLpApys');
const getEsterApys = require('./getEsterApys');
const getSpookyBooApy = require('./getSpookyBooApy');
const getFantomBifiMaxiApy = require('./getFantomBifiMaxiApy');
const getTombApys = require('./getTombApys');
const getSpiritApys = require('./getSpiritApy');
const getCurveApys = require('./getCurveApys');
const getScreamApys = require('./getScreamApys');
const getSteakHouseLpApys = require('./getSteakHouseLpApys');
const getStakeSteakLpApys = require('./getStakeSteakLpApys');
const getTosdisLpApys = require('./tosdis/getTosdisLpApys');
const getJetswapApys = require('./getJetswapApys');
const getGeistLpApys = require('./getGeistLpApys');
const getSpellApys = require('./getSpellApys');
const getSingularApys = require('./getSingularApys');
const getPearzapApys = require('./getPearzapApys');
const getBeethovenxApys = require('./getBeethovenxApys');
const getGeistLendingApys = require('./getGeistLendingApys');

const getApys = [
  getSpookyLpApys,
  getFroyoLpApys,
  getEsterApys,
  getSpookyBooApy,
  getFantomBifiMaxiApy,
  getTombApys,
  getSpiritApys,
  getCurveApys,
  getScreamApys,
  getSteakHouseLpApys,
  getStakeSteakLpApys,
  getTosdisLpApys,
  getJetswapApys,
  getSpellApys,
  getGeistLpApys,
  getSingularApys,
  getPearzapApys,
  getBeethovenxApys,
  getGeistLendingApys,
];

const getFantomApys = async () => {
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

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getFantomApys };
