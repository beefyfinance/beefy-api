const getVenusApys = require('./venus/getVenusApys');
const { getOOELpApys } = require('./ooe/getOOELpApys');
const getStargateApys = require('./stargate/getStargateBscApys');
const { getDotDotApy } = require('./getDotDotApy');
const getThenaApys = require('./getThenaApys');
const { getPenpieApys } = require('./getPenpieApys');
const { getEquilibriaApys } = require('../common/getEquilibriaApys');
const { getBeefyBscCowApys } = require('./getBeefyBscCowApys');

const getApys = [
  getOOELpApys,
  getVenusApys,
  getStargateApys,
  getDotDotApy,
  getThenaApys,
  getPenpieApys,
  () => getEquilibriaApys(require('../../../data/bsc/pendlePools.json')),
  getBeefyBscCowApys,
];

const getBSCApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getBscApys error', result.reason);
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
  console.log(`> [APY] BSC finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getBSCApys };
