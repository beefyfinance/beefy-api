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
const BATCH_INTERVAL = 5 * 1000;

let apys = {};

const getApys = () => {
  return apys;
};

const batches = [
  [
    getBifiMaxiApy,
    getCakeApys,
    getCakePoolApy,
    getCakeLpApys,
    getFortubeApys,
    getBakePoolApy,
    getBakeryLpApys,
    getNarLpApys,
    getVenusApys
  ],
  [
    getJetfuelLpApys,
    getBdoLpApys,
    getSbdoLpApys,
    getHelmetPoolApy,
    getHelmetLpApy,
    getBhcPoolApy,
    getKebabLpApys,
    getKebabPoolApy,
    getMonsterLpApys,
    getJulDPoolApy
  ],
  [
    getNyacashNyasLpApys,
    getSpongeLpApys,
    getSpongePoolApy,
    getAutoApys,
    getMdexLpApys,
    getBtdLpApys,
    getBtsLpApys,
    getCrowLpApys,
    getMidasLpApys,
    getCafeLpApys
  ],
  [
    getRamenLpApys,
    get1inchLpApys,
    getDegensLpApys,
    getJulLpApys,
    getBeltApys,
    getPangolinApys,
    getSwipeLpApys
  ]
]

const updateApys = async ()  => {
  for (let i = 0; i < batches.length; i++) {
    console.log('>>>>>>>>>>>>>>>>> batch', i, batches[i], '<<<<<<<<<<<<<<<<<<<');
    
    console.log('$$$$$ a');
    const values = await Promise.all(batches[i].map(fn => fn()));
    console.log('$$$$$ b');
    
    for (item of values) {
      console.log('$$$$$ c');
      apys = { ...apys, ...item };
    }
    
    console.log(`> getApys (${i + 1}/${batches.length})`);
    console.log(apys);
    await sleep(BATCH_INTERVAL);
  }

  setTimeout(updateApys, QUERY_INTERVAL);
};

setTimeout(updateApys, BATCH_INTERVAL);


module.exports = getApys;
