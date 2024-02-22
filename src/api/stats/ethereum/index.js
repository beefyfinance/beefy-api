const { getAuraApys } = require('./getAuraApys');
const { getConvexApys } = require('./getConvexApys');
const getStargateEthApys = require('./getStargateEthApys');
const getAuraBalApy = require('./getAuraBalApy');
const { getSushiApys } = require('./getSushiLpApys');
const { getSynapseLpApys } = require('./getSynapseLpApys');
const getSolidlyApys = require('./getSolidlyApys');
const { getConvexCrvApy } = require('./getConvexCrvApy');
const getEulerApys = require('./getEulerApys');
const { getVerseLpApys } = require('./getVerseApys');
const { getBifiMaxiApy } = require('./getBifiMaxiApy');
const { getConvexCvxTokensApy } = require('./getConvexCvxTokensApy');
const { getCurveApys } = require('./getCurveApys');
const { getConicApys } = require('./getConicApys');
const { getApeStakingApy } = require('./getApeStakingApy');
const { getConvexCvxApy } = require('./getConvexCvxApy');
const getGammaApy = require('./getUniswapGammaApys');
const { getETHCompoundV3Apys } = require('./getEthCompoundApys');
const { getPrismaApys } = require('./getPrismaApys');
const { getAcrossApys } = require('./getAcrossApys');
const { getEthSiloApys } = require('./getEthereumSiloApys');
const getMerklApys = require('./getMerklApys');
const { getbeQIApy } = require('./getbeQIApy');

const getApys = [
  getAcrossApys,
  getApeStakingApy,
  getAuraApys,
  getbeQIApy,
  getCurveApys,
  getConvexApys,
  getConvexCrvApy,
  getConvexCvxApy,
  getConvexCvxTokensApy,
  getConicApys,
  getPrismaApys,
  getStargateEthApys,
  getBifiMaxiApy,
  getAuraBalApy,
  getSushiApys,
  getSynapseLpApys,
  getSolidlyApys,
  // getEulerApys, // => delete this? code already doesn't work...
  getVerseLpApys,
  getGammaApy,
  getETHCompoundV3Apys,
  getEthSiloApys,
  getMerklApys,
];

const getEthereumApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getEthereumApys error', result.reason);
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
  console.log(`> [APY] Ethereum finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getEthereumApys };
