const getLydLpApys = require('./getLydLpApys');
const getOliveLpApys = require('./getOliveLpApys');
const getPangolinApys = require('./getPangolinLpApys');
const getSnobLpApys = require('./getSnobLpApys');
const getGondolaLpApys = require('./getGondolaLpApys');
const getComAvaxApys = require('./getComAvaxLpApys');

const getApys = [
  getComAvaxApys,
  getLydLpApys,
  getPangolinApys,
  getSnobLpApys,
  getOliveLpApys,
  getGondolaLpApys,
];

const getAvaxApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getAvaxApys error', result.reason);
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

module.exports = { getAvaxApys };
