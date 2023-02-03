const getBeltApys = require('./belt/getBeltApys');
const { getDegensLpApys } = require('./degens');
const getJetswapApys = require('./jetfuel/getJetswapApys');
const { getCakeLpV2Apys } = require('./pancake/getCakeLpV2Apys');
const getCakeV2PoolApy = require('./pancake/getCakeV2PoolApy');
const getVenusApys = require('./venus/getVenusApys');
const getMdexBscLpApys = require('./mdex/getMdexBscLpApys');
const getMdexMdxApy = require('./mdex/getMdexMdxApy');
const getYelApys = require('./yel/getYelApys');
const getBifiMaxiApy = require('./beefy/getBifiMaxiApy');
const getOOELpApys = require('./ooe/getOOELpApys');
const getBifiGovApy = require('./beefy/getBifiGovApy');
const getMoonpotApys = require('./pots/getMoonpotApys');
const getBiswapApys = require('./biswap/getBiswapApys');
const getStargateApys = require('./stargate/getStargateBscApys');
const getValasApys = require('./valas/getValasApys');
const getValasLpApys = require('./valas/getValasLpApys');
const { getDotDotApy } = require('./getDotDotApy');
const getConeApys = require('./getConeApys');
const getThenaApys = require('./getThenaApys');
const { getWombexApy } = require('./getWombexApy');
const { getSwapFishApys } = require('./getSwapFishApys');

const getApys = [
  getSwapFishApys,
  getBeltApys,
  getBifiGovApy,
  getBifiMaxiApy,
  getBiswapApys,
  getCakeLpV2Apys,
  getCakeV2PoolApy,
  getConeApys,
  getDegensLpApys,
  getJetswapApys,
  getMdexBscLpApys,
  getMdexMdxApy,
  getOOELpApys,
  getMoonpotApys,
  getVenusApys,
  getYelApys,
  getStargateApys,
  getValasApys,
  getValasLpApys,
  getDotDotApy,
  getWombexApy,
  getThenaApys,
];
// ^^ APYs are sorted alphabetically

const getBSCApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getBscApys error', result.reason);
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

module.exports = { getBSCApys };
