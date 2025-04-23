//const { getBeefyCowSonicApys } = require('./getBeefyCowSonicApys');
const getEqualizerApys = require('./getEqualizerApys');
const getBeetsSonicApys = require('./getBeetsSonicApys');
const { getBeefyCowSonicApys } = require('./getBeefyCowSonicApys');
const { getSwapxApys } = require('./getSwapxApys');
const { getSonicSiloApys } = require('./getSonicSiloApys');
const { getPenpieApys } = require('./getPenpieApys');
const { getEquilibriaApys } = require('../common/getEquilibriaApys');
const { getCurveApys } = require('./getCurveApys');
const { getAaveV3Apys } = require('./getAaveV3Apys');
const getShadowApys = require('./getShadowApys');
const { getBeSonicApy } = require('./getBeSonicApy');
const getDefiveApys = require('./getDefiveApys');
const { getEulerSonicApys } = require('./getEulerSonicApys');

const getApys = [
  getAaveV3Apys,
  getBeefyCowSonicApys,
  getEqualizerApys,
  getBeetsSonicApys,
  getSwapxApys,
  getPenpieApys,
  () => getEquilibriaApys(require('../../../data/sonic/pendlePools.json')),
  getCurveApys,
  getSonicSiloApys,
  getShadowApys,
  getBeSonicApy,
  getDefiveApys,
  getEulerSonicApys,
];

const getSonicApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getSonicApys error', result.reason);
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
  console.log(`> [APY] Sonic finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getSonicApys };
