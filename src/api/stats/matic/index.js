const { getAaveApys } = require('./getAaveApys');
const { getSushiLpApys } = require('./getSushiLpApys');
const { getSushiOhmLpApys } = require('./getSushiOhmLpApys');
const getPolygonBifiGovApy = require('./getPolygonBifiGovApy');
const { getPolygonBifiMaxiApy } = require('./getPolygonBifiMaxiApy');
const { getCurveApys } = require('./getCurveApys');
const { getConvexApys } = require('./getConvexApys');
const getJetswapApys = require('./getJetswapApys');
const { getApeLpApys } = require('./getApeLpApys');
const getMaiApys = require('./getMaiApys').default;
const getMaiCurveApys = require('./getMaiCurveApys');
const { getTelxchangeApys } = require('./getTelxchangeApys');
const { getQuickSingleApys } = require('./getQuickSingleApys');
import getKyberLpApys from './getKyberLpApys';
import { getQuickDualLpApys } from './getQuickDualLpApys';
import { getJarvisApys } from './getJarvisApys';
const getStargateApys = require('./getStargatePolygonApys');
const getbeQiApy = require('./getbeQiApy');
const getbeQiEarnApy = require('./getbeQiEarnApy');
const getRipaeApys = require('./getRipaeApys');
const getBalancerPolyApys = require('./getBalancerPolyApys');
const getGiddyApys = require('./getGiddyApys');
const getDystopiaApys = require('./getDystopiaApys');
const { getHopApys } = require('./getHopApys');
const { getMvxApys } = require('./getMvxApys');
const { getAaveV3Apys } = require('./getAaveV3Apys');
const { getGnsApys } = require('./getGnsApys');
const getKyberPolygonApys = require('./getKyberPolygonApys');
const getOvixApys = require('./getOvixApys');
const { getPearlApys } = require('./getPearlApys');
const { getQuickGammaApys } = require('./getQuickGammaApys');
const getBetSwirlSingleApy = require('./getBetSwirlSingleApy');
const getRetroGammaApys = require('./getRetroGammaApys');
const getAuraPolygonApys = require('./getAuraPolygonApys');

const getApys = [
  getbeQiApy,
  getbeQiEarnApy,
  getQuickSingleApys,
  getQuickDualLpApys,
  getQuickGammaApys,
  getAaveApys,
  getSushiLpApys,
  getSushiOhmLpApys,
  getPolygonBifiGovApy,
  getPolygonBifiMaxiApy,
  getCurveApys,
  getConvexApys,
  getApeLpApys,
  getMaiApys,
  getMaiCurveApys,
  getJetswapApys,
  getTelxchangeApys,
  getKyberLpApys,
  getJarvisApys,
  getStargateApys,
  getRipaeApys,
  getBalancerPolyApys,
  getGiddyApys,
  getDystopiaApys,
  getHopApys,
  getMvxApys,
  getAaveV3Apys,
  getGnsApys,
  getKyberPolygonApys,
  getOvixApys,
  getPearlApys,
  getBetSwirlSingleApy,
  getRetroGammaApys,
  getAuraPolygonApys,
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
