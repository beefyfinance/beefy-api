const getBeltApys = require('./belt/getBeltApys');
const { getDegensLpApys } = require('./degens');
const getJetswapApys = require('./jetfuel/getJetswapApys');
const { getCakeLpV2Apys } = require('./pancake/getCakeLpV2Apys');
const getVenusApys = require('./venus/getVenusApys');
const getMdexBscLpApys = require('./mdex/getMdexBscLpApys');
const getMdexMdxApy = require('./mdex/getMdexMdxApy');
const getYelApys = require('./yel/getYelApys');
const getBifiMaxiApy = require('./beefy/getBifiMaxiApy');
const getOOELpApys = require('./ooe/getOOELpApys');
const getBifiGovApy = require('./beefy/getBifiGovApy');
const getBiswapApys = require('./biswap/getBiswapApys');
const getStargateApys = require('./stargate/getStargateBscApys');
const getValasApys = require('./valas/getValasApys');
const { getDotDotApy } = require('./getDotDotApy');
const getConeApys = require('./getConeApys');
const getThenaApys = require('./getThenaApys');

const getApys = [
  getBeltApys,
  getBifiGovApy,
  getBifiMaxiApy,
  getBiswapApys,
  getCakeLpV2Apys,
  getConeApys,
  getDegensLpApys,
  getJetswapApys,
  getMdexBscLpApys,
  getMdexMdxApy,
  getOOELpApys,
  getVenusApys,
  getYelApys,
  getStargateApys,
  getValasApys,
  getDotDotApy,
  getThenaApys,
];
// ^^ APYs are sorted alphabetically

const getBSCApys = async () => {
  const start = Date.now();
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

  const end = Date.now();
  console.log(`> [APY] BSC finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getBSCApys };
