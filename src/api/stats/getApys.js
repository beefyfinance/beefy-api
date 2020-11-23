const getFryApys = require('./fry/getFryApys');
const getCakeApys = require('./pancake/getCakeApys');
const getCakePoolApy = require('./pancake/getCakePoolApy');
const getCakeLpApys = require('./pancake/getCakeLpApys');
const getFortubeApys = require('./fortube/getFortubeApys');
const getThugsLpApys = require('./thugs/getThugsLpApys');
const getDrugsApys = require('./thugs/getDrugsApys');

const getApys = async () => {
  let apys = {};
  const values = await Promise.all([
    getFryApys(),
    getCakeApys(),
    getCakePoolApy(),
    getCakeLpApys(),
    getFortubeApys(),
    getThugsLpApys(),
    getDrugsApys(),
  ]);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

module.exports = getApys;
