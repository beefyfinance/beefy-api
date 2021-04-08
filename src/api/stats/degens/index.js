const getRamenLpApys = require('../ramen/getRamenLpApys');
const getBlizzardApy = require('./getBlizzardApy');
const getBlizzardLpApys = require('./getBlizzardLpApys');
const getSaltLpApys = require('./getSaltLpApys');
const getApeApys = require('./getApeLpApys');
const getApeBananaApys = require('./getApeBananaApy');
const getSoupApys = require('./getSoupLpApys');
const getMemeFarmApys = require('./getMemeFarmLpApys');
const getSquirrelApys = require('./getSquirrelLpApys');
const getSlimeApys = require('./getSlimeLpApys');
const getSpaceLpApys = require('./getSpaceLpApys');
const getNautApy = require('./getNautApy');
const getHpsApys = require('./getHpsApys');
const getZefiLpApys = require('./getZefiLpApys');
const getThunderLpApys = require('./getThunderLpApys');
const getSwampyLpApys = require('./getSwampyLpApys');
const getSwampyCakeLpApys = require('./getSwampyCakeLpApys');
const getYieldBayLpApys = require('./getYieldBayLpApys');
const getBingoLpApys = require('./getBingoLpApys');
const getSwampyCakeApy = require('./getSwampyCakeApy');

const getApys = [
  getRamenLpApys,
  getBlizzardApy,
  getBlizzardLpApys,
  getSaltLpApys,
  getApeApys,
  getApeBananaApys,
  getSoupApys,
  getMemeFarmApys,
  getSquirrelApys,
  getSlimeApys,
  getSpaceLpApys,
  getNautApy,
  getHpsApys,
  getZefiLpApys,
  getThunderLpApys,
  getSwampyLpApys,
  getSwampyCakeLpApys,
  getSwampyCakeApy,
  getYieldBayLpApys,
  getBingoLpApys,
];

const getDegensLpApys = async () => {
  let apys = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;

};

module.exports = { getDegensLpApys };