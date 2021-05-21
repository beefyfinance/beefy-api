const get1inchLpApys = require('./1inch/get1inchLpApys');
const get1inchApy = require('./1inch/get1inchApy');
const getAlpacaLpApys = require('./alpaca/getAlpacaLpApys');
const getAlpacaApys = require('./alpaca/getAlpacaApys');
const getAutoApys = require('./auto/getAutoApys');
const getBakePoolApy = require('./bakery/getBakePoolApy');
const getBakeryLpApys = require('./bakery/getBakeryLpApys');
const getBdoLpApys = require('./bdollar/getBdoLpApys');
const getSbdoLpApys = require('./bdollar/getSbdoLpApys');
const getBeltApys = require('./belt/getBeltApys');
const getBhcPoolApy = require('./bhc/getBhcPoolApy');
const getBtdLpApys = require('./bolt/getBtdLpApys');
const getBtsLpApys = require('./bolt/getBtsLpApys');
const getBunnyRewardsApy = require('./bunny/getBunnyRewardsApy');
const getCafeLpApys = require('./cafe/getCafeLpApys');
const getCrowLpApys = require('./crow/getCrowLpApys');
const { getDegensLpApys } = require('./degens');
const getDoppleApys = require('./dopple/getDoppleApys');
const getEllipsisLpApys = require('./ellipsis/getEllipsisLpApys');
const getFortressApys = require('./fortress/getFortressApys');
const getIcarusApys = require('./icarus/getIcarusApys');
const getJetfuelLpApys = require('./jetfuel/getJetfuelLpApys');
const getJulLpApys = require('./julb/getJulLpApys');
const getKebabLpApys = require('./kebab/getKebabLpApys');
const getKebabPoolApy = require('./kebab/getKebabPoolApy');
const getNarLpApys = require('./narwhal/getNarLpApys');
const getCakeApys = require('./pancake/getCakeApys');
const getCakePoolApy = require('./pancake/getCakePoolApy');
const { getCakeLpApys } = require('./pancake/getCakeLpApys');
const getPumpyLpApys = require('./pumpy/getPumpyLpApys');
const getSpongeLpApys = require('./sponge/getSpongeLpApys');
const getSpongePoolApy = require('./sponge/getSpongePoolApy');
const getSwipeLpApys = require('./swipe/getSwipeLpApys');
const getSwirlLpApys = require('./swirl/getSwirlLpApys');
const getTyphLpApys = require('./typhoon/getTyphLpApys');
const getVenusApys = require('./venus/getVenusApys');

const getApys = [
  get1inchLpApys,
  get1inchApy,
  getAlpacaLpApys,
  getAlpacaApys,
  getAutoApys,
  getBakePoolApy,
  getBakeryLpApys,
  getBdoLpApys,
  getSbdoLpApys,
  getBeltApys,
  getBhcPoolApy,
  getBtdLpApys,
  getBtsLpApys,
  getBunnyRewardsApy,
  getCafeLpApys,
  getCrowLpApys,
  getDegensLpApys,
  getDoppleApys,
  getEllipsisLpApys,
  getFortressApys,
  getIcarusApys,
  getJetfuelLpApys,
  getJulLpApys,
  getKebabLpApys,
  getKebabPoolApy,
  getNarLpApys,
  getCakeApys,
  getCakePoolApy,
  getCakeLpApys,
  getPumpyLpApys,
  getSpongeLpApys,
  getSpongePoolApy,
  getSwipeLpApys,
  getSwirlLpApys,
  getTyphLpApys,
  getVenusApys,
];

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
