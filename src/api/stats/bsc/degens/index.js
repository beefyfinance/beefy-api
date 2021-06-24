const getRamenLpApys = require('./getRamenLpApys');
const getBlizzardApy = require('./getBlizzardApy');
const getBlizzardLpApys = require('./getBlizzardLpApys');
const getSaltLpApys = require('./getSaltLpApys');
const getApeApys = require('./getApeApys');
const getSoupApys = require('./getSoupLpApys');
const getSquirrelApys = require('./getSquirrelLpApys');
const getSpaceLpApys = require('./getSpaceLpApys');
const getHpsApys = require('./getHpsApys');
const getZefiLpApys = require('./getZefiLpApys');
const getThunderLpApys = require('./getThunderLpApys');
const getSwampApys = require('./getSwampApys');
const getSwampyCakeLpApys = require('./getSwampyCakeLpApys');
const getYieldBayLpApys = require('./getYieldBayLpApys');
const getSwampySwampApy = require('./getSwampySwampApy');
const getSwampyCakeApy = require('./getSwampyCakeApy');
const getMarshLpApys = require('./getMarshLpApys');
const getSatisLpApys = require('./getSatisLpApys');
const getGoalLpApys = require('./getGoalLpApys');
const getTofyLpApys = require('./getTofyLpApys');
const getGarudaApys = require('./getGarudaApys');
const getIronApys = require('./getIronApys');
const getIronDndApys = require('./getIronDndApys');
const getIronSingleApys = require('./getIronSingleApys');
const getDumplingApys = require('./getDumplingApys');
const getPantherApys = require('./getPantherApys');
const getMemeFarmApys = require('./getMemeFarmLpApys');

const getApys = [
  getRamenLpApys,
  getBlizzardApy,
  getBlizzardLpApys,
  getSaltLpApys,
  getApeApys,
  getSoupApys,
  getSquirrelApys,
  getSpaceLpApys,
  getHpsApys,
  getZefiLpApys,
  getThunderLpApys,
  getSwampApys,
  getSwampyCakeLpApys,
  getSwampyCakeApy,
  getYieldBayLpApys,
  getSwampySwampApy,
  getMarshLpApys,
  getSatisLpApys,
  getGoalLpApys,
  getTofyLpApys,
  getGarudaApys,
  getIronApys,
  getIronDndApys,
  getIronSingleApys,
  getDumplingApys,
  getPantherApys,
  getMemeFarmApys,
];

const getDegensLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getDegensApys error', result.reason);
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

module.exports = { getDegensLpApys };
