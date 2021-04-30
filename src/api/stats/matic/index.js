const getKrillLpApys = require('./getKrillLpApys');
const getComethLpApys = require('./getComethLpApys');
const getQuickLpApys = require('./getQuickLpApys');



const getApys = [
  getKrillLpApys,
  getComethLpApys,
  getQuickLpApys,
];

const getMaticApys = async () => {
  let apys = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;

};

module.exports = { getMaticApys };