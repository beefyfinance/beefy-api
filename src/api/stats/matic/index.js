const { getCurveApys } = require('./getCurveApys');
const { getConvexApys } = require('./getConvexApys');
const getStargateApys = require('./getStargatePolygonApys');
const getBalancerPolyApys = require('./getBalancerPolyApys');
const { getAaveV3Apys } = require('./getAaveV3Apys');
const { getGnsApys } = require('./getGnsApys');
const getAuraPolygonApys = require('./getAuraPolygonApys');
const { getPolygonCompoundV3Apys } = require('./getPolygonCompoundApys');
const { getBeefyCowPolyApys } = require('./getBeefyCowPolyApys');
const { getMorphoApys } = require('../common/morpho/getMorphoApys');
const { POLYGON_CHAIN_ID } = require('../../../constants');

const getApys = [
  getCurveApys,
  getConvexApys,
  getStargateApys,
  getBalancerPolyApys,
  getAaveV3Apys,
  getGnsApys,
  getAuraPolygonApys,
  getPolygonCompoundV3Apys,
  getBeefyCowPolyApys,
  () => getMorphoApys(POLYGON_CHAIN_ID, require('../../../data/matic/morphoPools.json')),
];

const BATCH_SIZE = 15;

const getMaticApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let results = [];
  for (let i = 0; i < getApys.length; i += BATCH_SIZE) {
    const batchApys = getApys.slice(i, i + BATCH_SIZE);
    const promises = [];
    batchApys.forEach(getApy => promises.push(getApy()));
    const batchResults = await Promise.allSettled(promises);
    results = [...results, ...batchResults];
  }

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

  const end = Date.now();
  console.log(`> [APY] Polygon finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getMaticApys };
