const getKrillLpApys = require('./getKrillLpApys');
const getComethLpApys = require('./getComethLpApys');
const getQuickLpApys = require('./getQuickLpApys');
const getAaveApys = require('./getAaveApys');
const getSushiLpApys = require('./getSushiLpApys');

const getApys = [getKrillLpApys, getComethLpApys, getQuickLpApys, getAaveApys, getSushiLpApys];

const getMaticApys = async () => {
  let apys = {};

  for (const getApy of getApys) {
    const apy = await getApy();
    apys = { ...apys, ...apy };
  }

  return apys;
};

module.exports = { getMaticApys };
