const getBeetsOpApys = require('./getBeetsOpApys');
const getCurveApys = require('./getCurveApys');
const getVelodromeApys = require('./getVelodromeApys');
const getStargateOpApys = require('./getStargateOpApys');
const getbeVeloApy = require('./getbeVeloApy');
const getOptimismBifiGovApy = require('./getOptimismBifiEarningsApy');
const { getAaveV3Apys } = require('./getAaveV3Apys');
const { getRipaeApys } = require('./getRipaeApys');
const { getSonneApys } = require('./getSonneApys');
const { getOptimismBifiMaxiApy } = require('./getOptimismBifiMaxiApy');
const { getHopApys } = require('./getHopApys');
const { getHopOpApys } = require('./getHopOpApys');

const getApys = [
  getBeetsOpApys,
  getCurveApys,
  getVelodromeApys,
  getStargateOpApys,
  getbeVeloApy,
  getOptimismBifiGovApy,
  getOptimismBifiMaxiApy,
  getAaveV3Apys,
  getRipaeApys,
  // getSonneApys,
  getHopApys,
  getHopOpApys,
];

const getOptimismApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getOptimismApys error', result.reason);
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

module.exports = { getOptimismApys };
