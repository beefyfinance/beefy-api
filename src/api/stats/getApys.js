const getCakeApys = require('./pancake/getCakeApys');
const getCakePoolApy = require('./pancake/getCakePoolApy');
const { getCakeLpApys } = require('./pancake/getCakeLpApys');
const getFortubeApys = require('./fortube/getFortubeApys');
const getBifiMaxiApy = require('./beefy/getBifiMaxiApy');
const getBakePoolApy = require('./bakery/getBakePoolApy');
const getBakeryLpApys = require('./bakery/getBakeryLpApys');
const getNarLpApys = require('./narwhal/getNarLpApys');
const getVenusApys = require('./venus/getVenusApys');
const getJetfuelLpApys = require('./jetfuel/getJetfuelLpApys');
const getBdoLpApys = require('./bdollar/getBdoLpApys');
const getSbdoLpApys = require('./bdollar/getSbdoLpApys');
const getHelmetPoolApy = require('./helmet/getHelmetPoolApy');
const getHelmetLpApy = require('./helmet/getHelmetLpApy');
const getBhcPoolApy = require('./bhc/getBhcPoolApy');
const getKebabLpApys = require('./kebab/getKebabLpApys');
const getKebabPoolApy = require('./kebab/getKebabPoolApy');
const getMonsterLpApys = require('./monster/getMonsterLpApys');
const getJulDPoolApy = require('./julb/getJuldPoolApy');
const getNyacashNyasLpApys = require('./nyanswop/getNyacashNyasLpApys');
const getSpongeLpApys = require('./sponge/getSpongeLpApys');
const getSpongePoolApy = require('./sponge/getSpongePoolApy');
const getAutoApys = require('./auto/getAutoApys');
const getMdexLpApys = require('./mdex/getMdexLpApys');
const getBtdLpApys = require('./bolt/getBtdLpApys');
const getBtsLpApys = require('./bolt/getBtsLpApys');
const getCrowLpApys = require('./crow/getCrowLpApys');
const getMidasLpApys = require('./midas/getMidasLpApys');
const getCafeLpApys = require('./cafe/getCafeLpApys');
const getRamenLpApys = require('./ramen/getRamenLpApys');
const get1inchLpApys = require('./1inch/get1inchLpApys');
const { getDegensLpApys } = require('./degens');
const getJulLpApys = require('./julb/getJulLpApys');
const getBeltApys = require('./belt/getBeltApys');
const getPangolinApys = require('./pangolin/getPangolinLpApys');
const getSwipeLpApys = require('./swipe/getSwipeLpApys');
const getComAvaxApys = require('./complus/getComAvaxLpApys');
const getComBscApys = require('./complus/getComBscLpApys');
const getSnobLpApys = require('./snowball/getSnobLpApys');
const getSuperNovaLpApys = require('./supernova/getSuperNovaLpApys');
const getPumpyLpApys = require('./pumpy/getPumpyLpApys');
const getAlpacaLpApys = require('./alpaca/getAlpacaLpApys');
const getAlpacaApys = require('./alpaca/getAlpacaApys');
const getEllipsisLpApys = require('./ellipsis/getEllipsisLpApys');
const get1inchApy = require('./1inch/get1inchApy');
const getSwirlLpApys = require('./swirl/getSwirlLpApys');
const getOliveLpApys = require('./olive/getOliveLpApys');
const getMdexBscLpApys = require('./mdex/getMdexBscLpApys');
const getTyphLpApys = require('./typhoon/getTyphLpApys');

const INIT_DELAY = 4 * 60 * 1000;
const REFRESH_INTERVAL = 15 * 60 * 1000;

let apys = {};

const getApys = () => {
  return apys;
};

const updateApys = async () => {
  console.log('> updating apys');

  try {
    const values = await Promise.all([
      getBifiMaxiApy(),
      getCakeApys(),
      getCakePoolApy(),
      getCakeLpApys(),
      getFortubeApys(),
      getBakePoolApy(),
      getBakeryLpApys(),
      getNarLpApys(),
      getVenusApys(),
      getJetfuelLpApys(),
      getBdoLpApys(),
      getSbdoLpApys(),
      getHelmetPoolApy(),
      getHelmetLpApy(),
      getBhcPoolApy(),
      getKebabLpApys(),
      getKebabPoolApy(),
      getMonsterLpApys(),
      getJulDPoolApy(),
      getNyacashNyasLpApys(),
      getSpongeLpApys(),
      getSpongePoolApy(),
      getAutoApys(),
      getMdexLpApys(),
      getBtdLpApys(),
      getBtsLpApys(),
      getCrowLpApys(),
      getMidasLpApys(),
      getCafeLpApys(),
      getRamenLpApys(),
      get1inchLpApys(),
      get1inchApy(),
      getDegensLpApys(),
      getJulLpApys(),
      getBeltApys(),
      getPangolinApys(),
      getSwipeLpApys(),
      getComAvaxApys(),
      getComBscApys(),
      getSnobLpApys(),
      getSuperNovaLpApys(),
      getPumpyLpApys(),
      getAlpacaLpApys(),
      getAlpacaApys(),
      getEllipsisLpApys(),
      getSwirlLpApys(),
      getOliveLpApys(),
      getMdexBscLpApys(),
      getTyphLpApys(),
    ]);

    for (item of values) {
      apys = { ...apys, ...item };
    }

    console.log('> updated apys');
  } catch (err) {
    console.error('> apy initialization failed', err);
  }

  setTimeout(updateApys, REFRESH_INTERVAL);
};

setTimeout(updateApys, INIT_DELAY);

module.exports = getApys;
