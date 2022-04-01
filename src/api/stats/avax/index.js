const getLydLpApys = require('./getLydLpApys');
const getOliveApys = require('./getOliveApys');
const getAvaxBifiGovApy = require('./getAvaxBifiGovApy');
const { getAvaxBifiMaxiApy } = require('./getAvaxBifiMaxiApy');
const getJoeApys = require('./getJoeLpApys');
const getJoeDualApys = require('./getJoeDualLpApys');
const getJoeApy = require('./getJoeApy');
const getPangolinPNGApy = require('./getPangolinPNGApy');
const getCurveApys = require('./getCurveApys');
const { getAaveApys } = require('./getAaveApys');
const getSingularApys = require('./getSingularApys');
const getBlizzLpApys = require('./getBlizzLpApys');
const getBlizzLendingApys = require('./getBlizzLendingApys');
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

const getApys = [
  getPangolinV2Apys,
  getPangolinV2DualApys,
  getLydLpApys,
  getPangolinPNGApy,
  getOliveApys,
  getAvaxBifiGovApy,
  getAvaxBifiMaxiApy,
  getJoeApys,
  getJoeDualApys,
  getJoeApy,
  getCurveApys,
  getAaveApys,
  getSingularApys,
  getBlizzLpApys,
  getBlizzLendingApys,
  getBankerJoeApys,
  getSynapseApys,
  getSpellApys,
  getMaiApys,
  getMaiCurveApys,
  getGrapeApys,
  getRipaeApys,
  getStargateApys,
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
