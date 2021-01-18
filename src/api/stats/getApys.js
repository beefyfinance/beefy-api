const getFryApys = require('./fry/getFryApys');
const getCakeApys = require('./pancake/getCakeApys');
const getCakePoolApy = require('./pancake/getCakePoolApy');
const getCakeLpApys = require('./pancake/getCakeLpApys');
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

const INTERVAL = 5 * 60 * 1000;

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
    getThugsLpApys(),
    getDrugsApys(),
    getFryApys(),
    getBakePoolApy(),
    getBakeryLpApys(),
    getNarLpApys(),
    getVenusApys(),
    getJetfuelLpApys(),
    getBdoLpApys(),
    getSbdoLpApys(),
    getHelmetPoolApy()
  ]);
  
  for (item of values) {
    apys = { ...apys, ...item };
  }

  setTimeout(updateApys, INTERVAL);
  return apys;
};

updateApys();

module.exports = getApys;
