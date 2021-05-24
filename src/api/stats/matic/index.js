const getKrillLpApys = require('./getKrillLpApys');
const getComethLpApys = require('./getComethLpApys');
const getQuickLpApys = require('./getQuickLpApys');
const getAaveApys = require('./getAaveApys');
const getSushiLpApys = require('./getSushiLpApys');
const getComethMultiApys = require('./getComethMultiLpApys');
const getPolyzapApys = require('./getPolyzapApys');
const getPolygonBifiMaxiApy = require('./getPolygonBifiMaxiApy');
const getAddyApy = require('./getAddyApy');
const getCurveApys = require('./getCurveApys');

const getApys = [
  getKrillLpApys,
  getComethLpApys,
  getQuickLpApys,
  getAaveApys,
  getSushiLpApys,
  getComethMultiApys,
  getPolyzapApys,
  getPolygonBifiMaxiApy,
  getAddyApy,
  getCurveApys,
];

const getMaticApys = async () => {
  let apys = {};

  for (const getApy of getApys) {
    try {
      const apy = await getApy();
      apys = { ...apys, ...apy };
    } catch (e) {
      console.error('getMaticApys error', getApy.name, e);
    }
  }

  return apys;
};

module.exports = { getMaticApys };
