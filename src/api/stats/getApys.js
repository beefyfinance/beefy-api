const getFryApys = require('./fry/getFryApys');
const getCakeApys = require('./pancake/getCakeApys');
const getCakePoolApy = require('./pancake/getCakePoolApy');
const getCakeLpApys = require('./pancake/getCakeLpApys');
const getFortubeApys = require('./fortube/getFortubeApys');

let apys = {}
let loop_interval = 15000;

const getApys = async () => {
  return apys;
};

const getApysLoop = async () => {
  const values = await Promise.all([
    getFryApys(),
    getCakeApys(),
    getCakePoolApy(),
    getCakeLpApys(),
    getFortubeApys(),
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
