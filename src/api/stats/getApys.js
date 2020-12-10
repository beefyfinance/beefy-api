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

const getApys = async () => {
  let apys = {};

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

module.exports = getApys;
