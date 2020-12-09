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

let apys = {}
let loop_interval = 15000;

const getApys = async () => {
  return apys;
};

const getApysLoop = async () => {
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
  ]);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

setInterval(function(){ 
  getApysLoop(); 
}, loop_interval);

module.exports = getApys;
