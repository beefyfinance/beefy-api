const { sleep } = require('../../utils/time');

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

const QUERY_INTERVAL = 15 * 60 * 1000;
const BATCH_INTERVAL = 60 * 1000;

let apys = {};

const getApys = () => {
  return apys;
};

const mergeApys = async (values) => {
  console.log('mergeApys');
  for (item of values) {
    apys = { ...apys, ...item };
  }
  console.log(apys);
  await sleep(BATCH_INTERVAL);
}

const updateApys = async () => {
  let values = await Promise.all([
    getBifiMaxiApy(),
    getCakeApys(),
    getCakePoolApy(),
    getCakeLpApys(),
    getFortubeApys(),
    getBakePoolApy(),
    getBakeryLpApys(),
    getNarLpApys(),
    getVenusApys(),
    getJetfuelLpApys()
  ]);
  mergeApys(values);

  values = await Promise.all([
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
  ]);
  mergeApys(values);

  values = await Promise.all([
    getSpongeLpApys(),
    getSpongePoolApy(),
    getAutoApys(),
    getMdexLpApys(),
    getBtdLpApys(),
    getBtsLpApys(),
    getCrowLpApys(),
    getMidasLpApys(),
    getCafeLpApys(),
    getRamenLpApys()
  ]);
  mergeApys(values);

  values = await Promise.all([
    get1inchLpApys(),
    getDegensLpApys(),
    getJulLpApys(),
    getBeltApys(),
    getPangolinApys(),
    getSwipeLpApys()
  ]);
  mergeApys(values);

  console.log('> getApys');

  setTimeout(updateApys, QUERY_INTERVAL);
};


updateApys()

module.exports = getApys;
