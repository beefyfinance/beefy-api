const getFusefiLpApys = require('./getFusefiLpApys');
const getVoltageApys = require('./getVoltageApys');
const getFuseBeefySingleApy = require('./getFuseBeefySingleApy');
const getFuseBifiGovApy = require('./getFuseBifiGovApy');
const { getSushiLpApys } = require('./getSushiLpApys');
const { getFuseBifiMaxiApy } = require('./getFuseBifiMaxiApy');

const getApys = [
  getFusefiLpApys,
  getFuseBeefySingleApy,
  getFuseBifiGovApy,
  getFuseBifiMaxiApy,
  getSushiLpApys,
  getVoltageApys,
];

const getFuseApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getFuseApys error', result.reason);
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
  console.log(`> [APY] Fuse finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getFuseApys };
