const getCakeApys = require('./pancake/getCakeApys');
const getCakePoolApy = require('./pancake/getCakePoolApy');
const { getCakeLpApys } = require('./pancake/getCakeLpApys');
const getBifiMaxiApy = require('./beefy/getBifiMaxiApy');
const getBakePoolApy = require('./bakery/getBakePoolApy');
const getBakeryLpApys = require('./bakery/getBakeryLpApys');
const getNarLpApys = require('./narwhal/getNarLpApys');
const getVenusApys = require('./venus/getVenusApys');
const getJetfuelLpApys = require('./jetfuel/getJetfuelLpApys');
const getBdoLpApys = require('./bdollar/getBdoLpApys');
const getSbdoLpApys = require('./bdollar/getSbdoLpApys');
const getBhcPoolApy = require('./bhc/getBhcPoolApy');
const getKebabLpApys = require('./kebab/getKebabLpApys');
const getKebabPoolApy = require('./kebab/getKebabPoolApy');
const getSpongeLpApys = require('./sponge/getSpongeLpApys');
const getSpongePoolApy = require('./sponge/getSpongePoolApy');
const getAutoApys = require('./auto/getAutoApys');
const getBtdLpApys = require('./bolt/getBtdLpApys');
const getBtsLpApys = require('./bolt/getBtsLpApys');
const getCrowLpApys = require('./crow/getCrowLpApys');
const getCafeLpApys = require('./cafe/getCafeLpApys');
const get1inchLpApys = require('./1inch/get1inchLpApys');
const { getDegensLpApys } = require('./degens');
const getJulLpApys = require('./julb/getJulLpApys');
const getBeltApys = require('./belt/getBeltApys');
const getSwipeLpApys = require('./swipe/getSwipeLpApys');
const getComAvaxApys = require('./complus/getComAvaxLpApys');
const getComBscApys = require('./complus/getComBscLpApys');
const getPumpyLpApys = require('./pumpy/getPumpyLpApys');
const getAlpacaLpApys = require('./alpaca/getAlpacaLpApys');
const getAlpacaApys = require('./alpaca/getAlpacaApys');
const getEllipsisLpApys = require('./ellipsis/getEllipsisLpApys');
const get1inchApy = require('./1inch/get1inchApy');
const getSwirlLpApys = require('./swirl/getSwirlLpApys');
const getMdexBscLpApys = require('./mdex/getMdexBscLpApys');
const getTyphLpApys = require('./typhoon/getTyphLpApys');
const getBunnyRewardsApy = require('./bunny/getBunnyRewardsApy');
const getFortressApys = require('./fortress/getFortressApys');
const { getAvaxApys } = require('./avax');
const getIcarusApys = require('./icarus/getIcarusApys');
const getDoppleApys = require('./dopple/getDoppleApys');
const { getMaticApys } = require('./matic');
const { getHecoApys } = require('./heco');
const { getFantomApys } = require('./fantom');

const INIT_DELAY = 30 * 1000;
const REFRESH_INTERVAL = 15 * 60 * 1000;

let apys = {};

const getApys = () => {
  return apys;
};

const updateApys = async () => {
  console.log('> updating apys');

  try {
    const results = await Promise.allSettled([
      getBifiMaxiApy(),
      getCakeApys(),
      getCakePoolApy(),
      getCakeLpApys(),
      getBakePoolApy(),
      getBakeryLpApys(),
      getNarLpApys(),
      getVenusApys(),
      getJetfuelLpApys(),
      getBdoLpApys(),
      getSbdoLpApys(),
      getBhcPoolApy(),
      getKebabLpApys(),
      getKebabPoolApy(),
      getSpongeLpApys(),
      getSpongePoolApy(),
      getAutoApys(),
      getBtdLpApys(),
      getBtsLpApys(),
      getCrowLpApys(),
      getCafeLpApys(),
      get1inchLpApys(),
      get1inchApy(),
      getDegensLpApys(),
      getJulLpApys(),
      getBeltApys(),
      getSwipeLpApys(),
      getComAvaxApys(),
      getComBscApys(),
      getPumpyLpApys(),
      getAlpacaLpApys(),
      getAlpacaApys(),
      getEllipsisLpApys(),
      getSwirlLpApys(),
      getMdexBscLpApys(),
      getTyphLpApys(),
      getBunnyRewardsApy(),
      getFortressApys(),
      getAvaxApys(),
      getIcarusApys(),
      getDoppleApys(),
      getMaticApys(),
      getFantomApys(),
      getHecoApys(),
    ]);

    for (const result of results) {
      if (result.status !== 'fulfilled') {
        console.warn('getApys error', result.reason);
        continue;
      }
      apys = { ...apys, ...result.value };
    }

    console.log('> updated apys');
  } catch (err) {
    console.error('> apy initialization failed', err);
  }

  setTimeout(updateApys, REFRESH_INTERVAL);
};

setTimeout(updateApys, INIT_DELAY);

module.exports = getApys;
