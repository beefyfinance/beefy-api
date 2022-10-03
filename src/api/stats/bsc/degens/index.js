const getApeApys = require('./getApeApys');
const getApeJungleApys = require('./getApeJungleApys');
const getPacocaApys = require('./getPacocaApys');
const getBabyApys = require('./getBabyApys');
const { getWSGApys } = require('./getWSGApys');
const getNftyApys = require('./getNftyApys');
const getBetuApys = require('./getBetuApys');
const getDibsApys = require('./getDibsApys');
const getEmpApys = require('./getEmpApys');
const getBombApys = require('./getBombApys');
const getRipaeApys = require('./getRipaeApys');

const getApys = [
  getApeApys,
  getApeJungleApys,
  getPacocaApys,
  getBabyApys,
  getWSGApys,
  getNftyApys,
  getBetuApys,
  getDibsApys,
  getEmpApys,
  getBombApys,
  getRipaeApys,
];

const getDegensLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  results.forEach((result, i) => {
    if (result.status !== 'fulfilled') {
      console.warn('getDegensApys error', i, getApys[i].name, result.reason);
      return;
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
  });

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getDegensLpApys };
