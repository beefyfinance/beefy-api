const getComethLpApys = require('./getComethLpApys');
const { getQuickLpApys } = require('./getQuickLpApys');
const { getAaveApys } = require('./getAaveApys');
const { getSushiLpApys } = require('./getSushiLpApys');
const getComethMultiApys = require('./getComethMultiLpApys');
const getPolyzapApys = require('./getPolyzapApys');
const getPolygonBifiMaxiApy = require('./getPolygonBifiMaxiApy');
const getAddyApy = require('./getAddyApy');
const getCurveApys = require('./getCurveApys');
const getIronApys = require('./getIronApys');
const getPolycatApys = require('./getPolycatApys');
const getWexPolyApys = require('./getWexPolyApys');
const { getBoneSwapApys } = require('./getBoneSwapApys');
const { getPolyQuityLpApys } = require('./getPolyQuityApys');
const { getApeLpApys } = require('./getApeLpApys');
const { getPolyyeldApys } = require('./getPolyyeldApys');
const { getPolypupApys } = require('./getPolypupApys');
const { get50kLpApys } = require('./get50kLpApys');
const { getDfynLpApys } = require('./getDfynLpApys');
const { getDfynDualFarmLpApys } = require('./getDfynDualFarmLpApys');

const getApys = [
  getComethLpApys,
  getQuickLpApys,
  getAaveApys,
  getSushiLpApys,
  getComethMultiApys,
  getPolyzapApys,
  getPolygonBifiMaxiApy,
  // getAddyApy,
  getCurveApys,
  // getIronApys,
  getPolycatApys,
  getWexPolyApys,
  getPolyyeldApys,
  getApeLpApys,
  getPolypupApys,
  // getPolyQuityLpApys,
  get50kLpApys,
  getDfynLpApys,
  getDfynDualFarmLpApys,
  getBoneSwapApys,
];

const getMaticApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getMaticApys error', result.reason);
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

module.exports = { getMaticApys };
