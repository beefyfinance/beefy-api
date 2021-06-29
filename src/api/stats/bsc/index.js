const get1inchLpApys = require('./1inch/get1inchLpApys');
const get1inchApy = require('./1inch/get1inchApy');
const getAlpacaLpApys = require('./alpaca/getAlpacaLpApys');
const getAlpacaApys = require('./alpaca/getAlpacaApys');
const getAutoApys = require('./auto/getAutoApys');
const getBakePoolApy = require('./bakery/getBakePoolApy');
const getBakeryLpApys = require('./bakery/getBakeryLpApys');
const getBeltApys = require('./belt/getBeltApys');
const getBhcPoolApy = require('./bhc/getBhcPoolApy');
const getBtdLpApys = require('./bolt/getBtdLpApys');
const getBtsLpApys = require('./bolt/getBtsLpApys');
const getBunnyRewardsApy = require('./bunny/getBunnyRewardsApy');
const { getDegensLpApys } = require('./degens');
const getDoppleApys = require('./dopple/getDoppleApys');
const getEllipsisLpApys = require('./ellipsis/getEllipsisLpApys');
const getEllipsisSingleAssetApy = require('./ellipsis/getEllipsisSingleAssetApy');
const getFortressApys = require('./fortress/getFortressApys');
const getIcarusApys = require('./icarus/getIcarusApys');
const getJetswapApys = require('./jetfuel/getJetswapApys');
const getJulLpApys = require('./julb/getJulLpApys');
const getKebabLpApys = require('./kebab/getKebabLpApys');
const getKebabPoolApy = require('./kebab/getKebabPoolApy');
const getNarLpApys = require('./narwhal/getNarLpApys');
const getCakeApys = require('./pancake/getCakeApys');
const getCakePoolApy = require('./pancake/getCakePoolApy');
const { getCakeLpApys } = require('./pancake/getCakeLpApys');
const getSpongeLpApys = require('./sponge/getSpongeLpApys');
const getSpongePoolApy = require('./sponge/getSpongePoolApy');
const getSwipeLpApys = require('./swipe/getSwipeLpApys');
const getVenusApys = require('./venus/getVenusApys');
const getComBscApys = require('./complus/getComBscLpApys');
const getMdexBscLpApys = require('./mdex/getMdexBscLpApys');
const getMdexMdxApy = require('./mdex/getMdexMdxApy');
const getGrandLpApys = require('./grand/getGrandLpApys');
const getWaultLpApys = require('./wault/getWaultLpApys');
const getTenfiApys = require('./tenfi/getTenfiApys');
const getCakeV2PoolApy = require('./pancake/getCakeV2PoolApy');
const getMerlinRewardsApy = require('./merlin/getMerlinRewardsApy');
const getBifiMaxiApy = require('./beefy/getBifiMaxiApy');

const getApys = [
  get1inchLpApys,
  get1inchApy,
  getAlpacaLpApys,
  getAlpacaApys,
  getAutoApys,
  getBakePoolApy,
  getBakeryLpApys,
  getBeltApys,
  getBhcPoolApy,
  getBifiMaxiApy,
  getBtdLpApys,
  getBtsLpApys,
  getBunnyRewardsApy,
  getCakeApys,
  getCakePoolApy,
  getCakeLpApys,
  getCakeV2PoolApy,
  getComBscApys,
  getDegensLpApys,
  getDoppleApys,
  getEllipsisLpApys,
  getEllipsisSingleAssetApy,
  getFortressApys,
  getGrandLpApys,
  getIcarusApys,
  getJetswapApys,
  getJulLpApys,
  getKebabLpApys,
  getKebabPoolApy,
  getMdexBscLpApys,
  getMdexMdxApy,
  getMerlinRewardsApy,
  getNarLpApys,
  getSpongeLpApys,
  getSpongePoolApy,
  getSwipeLpApys,
  getTenfiApys,
  getVenusApys,
  getWaultLpApys,
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
