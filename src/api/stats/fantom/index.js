const getSpookyLpApys = require('./getSpookyLpApys');
const getFroyoLpApys = require('./getFroyoLpApys');
const getEsterApys = require('./getEsterApys');
const getSpookyBooApy = require('./getSpookyBooApy');
const getFantomBifiGovApy = require('./getFantomBifiGovApy');
const { getFantomBifiMaxiApy } = require('./getFantomBifiMaxiApy');
const getTombApys = require('./getTombApys');
const getSpiritApys = require('./getSpiritApys');
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
const getSummitApys = require('./getSummitApys');
const getGeistLendingApys = require('./getGeistLendingApys');
const getfBeetsApy = require('./getfBeetsApy');
const getSpartacadabraApys = require('./getSpartacadabraApys');
const getPopsicleApys = require('./getPopsicleApys');
const get2ombApys = require('./get2ombApys');
const get3ombApys = require('./get3ombApys');
const get0xdaoApys = require('./get0xdaoApys');
const { getSushiLpApys } = require('./getSushiLpApys');

const getApys = [
  getSushiLpApys,
  getSpookyLpApys,
  getFroyoLpApys,
  getEsterApys,
  getSpookyBooApy,
  getFantomBifiGovApy,
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
  getSummitApys,
  getGeistLendingApys,
  getfBeetsApy,
  getSpartacadabraApys,
  getPopsicleApys,
  get2ombApys,
  get3ombApys,
  get0xdaoApys,
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
