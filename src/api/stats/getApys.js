const getCakeApys = require('./pancake/getCakeApys');
const getCakePoolApy = require('./pancake/getCakePoolApy');
const { getCakeLpApys } = require('./pancake/getCakeLpApys');
const getFortubeApys = require('./fortube/getFortubeApys');
const getThugsLpApys = require('./thugs/getThugsLpApys');
const getDrugsApys = require('./thugs/getDrugsApys');
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
const getJulLpApys = require('./julb/getJulLpApys');
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

const INTERVAL = 15 * 60 * 1000;

let apys = {};

const getApys = () => {
  return apys;
};

const updateApys = async () => {
  const values = await Promise.all([
    getBifiMaxiApy(),
    getCakeApys(),
    getCakePoolApy(),
    getCakeLpApys(),
    getFortubeApys(),
    // getThugsLpApys(),
    // getDrugsApys(),
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
    getJulLpApys(),
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
    getDegensLpApys()
  ]);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  console.log('> getApys');

  setTimeout(updateApys, INTERVAL);
};

updateApys();

module.exports = getApys;
