const getComethLpApys = require('./getComethLpApys');
const { getQuickLpApys } = require('./getQuickLpApys');
const { getAaveApys } = require('./getAaveApys');
const { getSushiLpApys } = require('./getSushiLpApys');
const { getSushiOhmLpApys } = require('./getSushiOhmLpApys');
const getComethMultiApys = require('./getComethMultiLpApys');
const getPolyzapApys = require('./getPolyzapApys');
const getPolygonBifiGovApy = require('./getPolygonBifiGovApy');
const { getPolygonBifiMaxiApy } = require('./getPolygonBifiMaxiApy');
const getCurveApys = require('./getCurveApys');
const getPolycatApys = require('./getPolycatApys');
const getWexPolyApys = require('./getWexPolyApys');
const getJetswapApys = require('./getJetswapApys');
const getIronSwapApys = require('./getIronSwapApys');
const getDinoswapApys = require('./getDinoswapApys');
const { getBoneSwapApys } = require('./getBoneSwapApys');
const { getPolyQuityLpApys } = require('./getPolyQuityApys');
const { getApeLpApys } = require('./getApeLpApys');
const { getPolypupApys } = require('./getPolypupApys');
const { get50kLpApys } = require('./get50kLpApys');
const { getDfynLpApys } = require('./getDfynLpApys');
const { getDfynDualFarmLpApys } = require('./getDfynDualFarmLpApys');
const { getFarmheroApys } = require('./getFarmheroApys');
const getMaiApys = require('./getMaiApys').default;
const { getTelxchangeApys } = require('./getTelxchangeApys');
const { getFarmheroSingleApy } = require('./getFarmheroSingleApy');
const getSwampApys = require('./getSwampApys');
const getPolyCrackerApys = require('./getPolyCrackerApys');
const { getPolygonFarmApys } = require('./getPolygonFarmApys');
const { getPearzapApys } = require('./getPearzapApys');
const getQuickSingleApys = require('./getQuickSingleApys');
const { getSandmanApys } = require('./getSandmanApys');
const { getPolyAlphaApys } = require('./getPolyAlphaApys');
import { getPolywiseApys } from './getPolywiseApys';
import { getPolysageApys } from './getPolysageApys';
import { getTetuApys } from './getTetuApys';
const { getSingularApys } = require('./getSingularApys');
import getCafeLpApys from './getCafeLpApys';
import getKyberLpApys from './getKyberLpApys';
import { getQuickDualLpApys } from './getQuickDualLpApys';

const getApys = [
  getComethLpApys,
  getQuickLpApys,
  getAaveApys,
  getSushiLpApys,
  getSushiOhmLpApys,
  getComethMultiApys,
  getPolyzapApys,
  getPolygonBifiGovApy,
  getPolygonBifiMaxiApy,
  getCurveApys,
  getPolycatApys,
  getWexPolyApys,
  getApeLpApys,
  getPolypupApys,
  // getPolyQuityLpApys,
  // get50kLpApys,
  getDfynLpApys,
  getDfynDualFarmLpApys,
  getBoneSwapApys,
  getMaiApys,
  getJetswapApys,
  getIronSwapApys,
  getTelxchangeApys,
  getFarmheroApys,
  getFarmheroSingleApy,
  getDinoswapApys,
  getSwampApys,
  // getPolyCrackerApys,
  getPolygonFarmApys,
  getPearzapApys,
  getQuickSingleApys,
  getSandmanApys,
  getPolyAlphaApys,
  getPolywiseApys,
  getPolysageApys,
  getTetuApys,
  getSingularApys,
  getCafeLpApys,
  getKyberLpApys,
  getQuickDualLpApys,
];

const BATCH_SIZE = 15;

const getMaticApys = async () => {
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

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getMaticApys };
