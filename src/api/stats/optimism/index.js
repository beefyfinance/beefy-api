const { getCurveApys } = require('./getCurveApys');
const getVelodromeApys = require('./getVelodromeApys');
const getAuraApys = require('./getAuraOptimismApys');
const getBeVeloV2Apr = require('./getBeVeloV2Apr');
const { getBeefyOPCowApys } = require('./getBeefyOPCowApys');
const { getMorphoApys } = require('../common/morpho/getMorphoApys');
const { OPTIMISM_CHAIN_ID } = require('../../../constants');

const getApys = [
  getAuraApys,
  getCurveApys,
  getVelodromeApys,
  getBeVeloV2Apr,
  getBeefyOPCowApys,
  () => getMorphoApys(OPTIMISM_CHAIN_ID, require('../../../data/optimism/morphoPools.json')),
];

const getOptimismApys = async () => {
  const start = Date.now();
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

  const end = Date.now();
  console.log(`> [APY] Optimism finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getOptimismApys };
