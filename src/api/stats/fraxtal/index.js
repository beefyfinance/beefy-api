const { getCurveApys } = require('./getCurveApys');
const { getCurveLendApys } = require('./getCurveLendApys');
const { getConvexApys } = require('./getConvexApys');
const { getConvexCvxFxsApys } = require('./getConvexCvxFxsApys');
const getRaApys = require('./getRaApys');
const { getVelodromeApys } = require('./getVelodromeApys');

const getApys = [
  getCurveApys,
  getCurveLendApys,
  getConvexApys,
  getConvexCvxFxsApys,
  getVelodromeApys,
  getRaApys,
];

const getFraxtalApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getFraxtalApys error', result.reason);
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
  console.log(`> [APY] Fraxtal finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getFraxtalApys };
