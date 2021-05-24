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
const getJetfuelLpApys = require('./jetfuel/getJetfuelLpApys');
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
const getTyphLpApys = require('./typhoon/getTyphLpApys');
const getVenusApys = require('./venus/getVenusApys');
const getComBscApys = require('./complus/getComBscLpApys');
const getMdexBscLpApys = require('./mdex/getMdexBscLpApys');
const getMdexMdxApy = require('./mdex/getMdexMdxApy');
const getGrandLpApys = require('./grand/getGrandLpApys');

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
  getBtdLpApys,
  getBtsLpApys,
  getBunnyRewardsApy,
  getCakeApys,
  getCakePoolApy,
  getCakeLpApys,
  getComBscApys,
  getDegensLpApys,
  getDoppleApys,
  getEllipsisLpApys,
  getEllipsisSingleAssetApy,
  getFortressApys,
  getGrandLpApys,
  getIcarusApys,
  getJetfuelLpApys,
  getJetswapApys,
  getJulLpApys,
  getKebabLpApys,
  getKebabPoolApy,
  getMdexBscLpApys,
  getMdexMdxApy,
  getNarLpApys,
  getSpongeLpApys,
  getSpongePoolApy,
  getSwipeLpApys,
  getTyphLpApys,
  getVenusApys,
];
// ^^ APYs are sorted alphabetically

const getBSCApys = async () => {
  let apys = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const values = await Promise.all(promises);

  for (const item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

module.exports = { getBSCApys };
