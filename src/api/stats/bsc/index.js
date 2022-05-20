const getAlpacaApys = require('./alpaca/getAlpacaApys');
const getBeltApys = require('./belt/getBeltApys');
const { getDegensLpApys } = require('./degens');
const getIcarusApys = require('./icarus/getIcarusApys');
const getJetswapApys = require('./jetfuel/getJetswapApys');
const getKebabLpApys = require('./kebab/getKebabLpApys');
const getKebabPoolApy = require('./kebab/getKebabPoolApy');
const getCakeApys = require('./pancake/getCakeApys');
const getCakePoolApy = require('./pancake/getCakePoolApy');
const { getCakeLpV2Apys } = require('./pancake/getCakeLpV2Apys');
const getVenusApys = require('./venus/getVenusApys');
const getMdexBscLpApys = require('./mdex/getMdexBscLpApys');
const getMdexMdxApy = require('./mdex/getMdexMdxApy');
const getTenfiApys = require('./tenfi/getTenfiApys');
const getYelApys = require('./yel/getYelApys');
const getCakeV2PoolApy = require('./pancake/getCakeV2PoolApy');
const getBifiMaxiApy = require('./beefy/getBifiMaxiApy');
const getOOELpApys = require('./ooe/getOOELpApys');
const { getFarmheroApys } = require('./farmhero/getFarmheroApys');
const getOmnifarmApys = require('./omnifarm/getOmnifarmApys');
const getBifiMaxiV2Apy = require('./beefy/getBifiMaxiV2Apy');
const getBifiGovApy = require('./beefy/getBifiGovApy');
const getMoonpotApys = require('./pots/getMoonpotApys');
const getBiswapApys = require('./biswap/getBiswapApys');
const getStargateApys = require('./stargate/getStargateBscApys');
const getValasApys = require('./valas/getValasApys');
const getValasLpApys = require('./valas/getValasLpApys');
const getbeCakeApy = require('./pancake/getbeCakeApy');
const getbeCakeEarnApy = require('./pancake/getbeCakeEarnApy');
const { getDotDotApy } = require('./getDotDotApy');

const getApys = [
  getAlpacaApys,
  getBeltApys,
  getBifiGovApy,
  getBifiMaxiApy,
  getBifiMaxiV2Apy,
  getBiswapApys,
  getCakeApys,
  getCakePoolApy,
  getCakeLpV2Apys,
  getCakeV2PoolApy,
  getDegensLpApys,
  getFarmheroApys,
  getIcarusApys,
  getJetswapApys,
  getKebabLpApys,
  getKebabPoolApy,
  getMdexBscLpApys,
  getMdexMdxApy,
  getOmnifarmApys,
  getOOELpApys,
  getMoonpotApys,
  getTenfiApys,
  getVenusApys,
  getYelApys,
  getStargateApys,
  getValasApys,
  getValasLpApys,
  getbeCakeApy,
  getbeCakeEarnApy,
  getDotDotApy,
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
