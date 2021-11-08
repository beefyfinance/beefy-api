const get1inchLpApys = require('./1inch/get1inchLpApys');
const get1inchApy = require('./1inch/get1inchApy');
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
const getTosdisLpApys = require('./tosdis/getTosdisLpApys');
const getYelApys = require('./yel/getYelApys');
const getCakeV2PoolApy = require('./pancake/getCakeV2PoolApy');
const getMerlinRewardsApy = require('./merlin/getMerlinRewardsApy');
const getBifiMaxiApy = require('./beefy/getBifiMaxiApy');
const getOOELpApys = require('./ooe/getOOELpApys');
const { getFarmheroApys } = require('./farmhero/getFarmheroApys');
const getOmnifarmApys = require('./omnifarm/getOmnifarmApys');
const getElkApys = require('./elk/getElkApys');
const getBifiMaxiV2Apy = require('./beefy/getBifiMaxiV2Apy');
const getBifiGovApy = require('./beefy/getBifiGovApy');
const getPotsApy = require('./pots/getPotsApy');

const getApys = [
  get1inchLpApys,
  get1inchApy,
  getAlpacaApys,
  getAutoApys,
  getBakePoolApy,
  getBakeryLpApys,
  getBeltApys,
  getBhcPoolApy,
  getBifiGovApy,
  getBifiMaxiApy,
  getBifiMaxiV2Apy,
  getBtdLpApys,
  getBtsLpApys,
  getBunnyRewardsApy,
  getCakeApys,
  getCakePoolApy,
  getCakeLpApys,
  getCakeV2PoolApy,
  getComBscApys,
  getDegensLpApys,
  // getDoppleApys,
  getElkApys,
  getEllipsisLpApys,
  getEllipsisSingleAssetApy,
  getFarmheroApys,
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
  getOmnifarmApys,
  getOOELpApys,
  getPotsApy,
  getSpongeLpApys,
  getSpongePoolApy,
  getSwipeLpApys,
  getTenfiApys,
  getTosdisLpApys,
  getVenusApys,
  getWaultLpApys,
  getYelApys,
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
