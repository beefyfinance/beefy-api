const getLydLpApys = require('./getLydLpApys');
const getOliveApys = require('./getOliveApys');
const getJoeApys = require('./getJoeLpApys');
const getJoeBoostedApys = require('./getJoeBoostedLpApys');
const getJoeDualApys = require('./getJoeDualLpApys');
const getJoeApy = require('./getJoeApy');
const getPangolinPNGApy = require('./getPangolinPNGApy');
const { getCurveApys } = require('./getCurveApys');
const { getAaveV3Apys } = require('./getAaveV3Apys');
const getBankerJoeApys = require('./getBankerJoeApys');
const getPangolinV2DualApys = require('./getPangolinV2DualApys');
import { getSynapseApys } from './getSynapseApys';
const getGrapeApys = require('./getGrapeApys');
const getRipaeApys = require('./getRipaeApys');
const getStargateApys = require('./getStargateAvaxApys');
const getSpellApys = require('./getSpellApys');
import { getMaiApys } from './getMaiApys';
import getMaiCurveApys from './getMaiCurveApys';
import { getPangolinV2Apys } from './getPangolinV2Apys';
import getbeJOEApy from './getbeJOEApy';
import getbeJOEEarnApy from './getbeJOEEarnApy';
const getSwapsicleApys = require('./getSwapsicleApys');
const { getGmxApys } = require('./getGmxApys');
const getKyberAvaxApys = require('./getKyberAvaxApys');
const getSoliSnekApys = require('./getSoliSnekApys');
const getBalancerApys = require('./getBalancerAvaxApys');
const { getJoeAutoAvaxApys } = require('./getJoeAutoAvaxApys');

const getApys = [
  getJoeAutoAvaxApys,
  getBalancerApys,
  getSoliSnekApys,
  getKyberAvaxApys,
  getGmxApys,
  getbeJOEApy,
  getbeJOEEarnApy,
  getPangolinV2Apys,
  getPangolinV2DualApys,
  getLydLpApys,
  getPangolinPNGApy,
  getOliveApys,
  getJoeApys,
  getJoeBoostedApys,
  // getJoeDualApys, Is broken.
  getJoeApy,
  getCurveApys,
  getAaveV3Apys,
  getBankerJoeApys,
  // // getSynapseApys, //disabled by weso long time ago, won't re-enable
  getSpellApys,
  getMaiApys,
  getMaiCurveApys,
  getGrapeApys,
  getRipaeApys,
  getStargateApys,
  getSwapsicleApys,
];

const getAvaxApys = async () => {
  const start = Date.now();
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

  const end = Date.now();
  console.log(`> [APY] Avalanche finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getAvaxApys };
