const getSpookyLpApys = require('./getSpookyLpApys');
const getSpookyBooApy = require('./getSpookyBooApy');
const getSpookyV2LpApys = require('./getSpookyV2LpApys');
const getFantomBifiGovApy = require('./getFantomBifiGovApy');
const { getFantomBifiMaxiApy } = require('./getFantomBifiMaxiApy');
const getTombApys = require('./getTombApys');
const getSpiritApys = require('./getSpiritApys');
const getCurveApys = require('./getCurveApys');
const getScreamApys = require('./getScreamApys');
const getSteakHouseLpApys = require('./getSteakHouseLpApys');
const getJetswapApys = require('./getJetswapApys');
const getGeistLpApys = require('./getGeistLpApys');
const getSpellApys = require('./getSpellApys');
const getBeethovenxApys = require('./getBeethovenxApys');
const getBeethovenxDualApys = require('./getBeethovenxDualApys');
const getGeistLendingApys = require('./getGeistLendingApys');
const getfBeetsApy = require('./getfBeetsApy');
const getSpartacadabraApys = require('./getSpartacadabraApys');
const getPopsicleApys = require('./getPopsicleApys');
const { getSushiLpApys } = require('./getSushiLpApys');
const getCreditumApys = require('./getCreditumApys');
const getRipaeApys = require('./getRipaeApys');
const getWigoApys = require('./getWigoApys');
const getbeFTMApy = require('./getbeFTMApy');
const getbeFtmEarnApy = require('./getbeFtmEarnApy');
const getBasedApy = require('./getBasedApys');
const getHectorApy = require('./getHectorApy');
const getStargateApys = require('./getStargateFantomApys');

const getApys = [
  getSushiLpApys,
  getSpookyLpApys,
  getSpookyBooApy,
  getSpookyV2LpApys,
  getFantomBifiGovApy,
  getFantomBifiMaxiApy,
  getTombApys,
  getSpiritApys,
  getCurveApys,
  getScreamApys,
  getSteakHouseLpApys,
  getJetswapApys,
  getSpellApys,
  getGeistLpApys,
  getBeethovenxApys,
  getBeethovenxDualApys,
  getGeistLendingApys,
  getfBeetsApy,
  getSpartacadabraApys,
  getPopsicleApys,
  getCreditumApys,
  getRipaeApys,
  getWigoApys,
  getbeFTMApy,
  getbeFtmEarnApy,
  getBasedApy,
  getHectorApy,
  getStargateApys,
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
