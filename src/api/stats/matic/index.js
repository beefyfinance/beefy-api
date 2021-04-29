const getKrillLpApys = require('./getKrillLpApys');
const getComethLpApys = require('./getComethLpApys');


const getApys = [
  getKrillLpApys,
  getComethLpApys, 
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