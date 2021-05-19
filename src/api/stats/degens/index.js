const getRamenLpApys = require('../ramen/getRamenLpApys');
const getBlizzardApy = require('./getBlizzardApy');
const getBlizzardLpApys = require('./getBlizzardLpApys');
const getSaltLpApys = require('./getSaltLpApys');
const getApeApys = require('./getApeLpApys');
const getApeBananaApys = require('./getApeBananaApy');
const getSoupApys = require('./getSoupLpApys');
const getSquirrelApys = require('./getSquirrelLpApys');
const getSpaceLpApys = require('./getSpaceLpApys');
const getHpsApys = require('./getHpsApys');
const getZefiLpApys = require('./getZefiLpApys');
const getThunderLpApys = require('./getThunderLpApys');
const getSwampyLpApys = require('./getSwampyLpApys');
const getSwampyCakeLpApys = require('./getSwampyCakeLpApys');
const getYieldBayLpApys = require('./getYieldBayLpApys');
const getSwampySwampApy = require('./getSwampySwampApy');
const getSwampyCakeApy = require('./getSwampyCakeApy');
const getMarshLpApys = require('./getMarshLpApys');
const getSatisLpApys = require('./getSatisLpApys');
const getGoalLpApys = require('./getGoalLpApys');
const getTofyLpApys = require('./getTofyLpApys');
const getGarudaApys = require('./getGarudaApys');
const getIronApys = require('./getIronApys');
const getIronDndApys = require('./getIronDndApys');
const getIronSingleDndApys = require('./getIronSingleDndApys');

const getApys = [
  getRamenLpApys,
  getBlizzardApy,
  getBlizzardLpApys,
  getSaltLpApys,
  getApeApys,
  getApeBananaApys,
  getSoupApys,
  getSquirrelApys,
  getSpaceLpApys,
  getHpsApys,
  getZefiLpApys,
  getThunderLpApys,
  getSwampyLpApys,
  getSwampyCakeLpApys,
  getSwampyCakeApy,
  getYieldBayLpApys,
  getSwampySwampApy,
  getMarshLpApys,
  getSatisLpApys,
  getGoalLpApys,
  getTofyLpApys,
  getGarudaApys,
  getIronApys,
  getIronDndApys,
  getIronSingleDndApys,
];

const getDegensLpApys = async () => {
  let apys = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const values = await Promise.all(promises);

  for (const item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

module.exports = { getDegensLpApys };
