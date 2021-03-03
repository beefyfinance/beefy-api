const getRamenLpApys = require('../ramen/getRamenLpApys');
const getSaltLpApys = require('./getSaltLpApys');
const getApeApys = require('./getApeLpApys');
const getSoupApys = require('./getSoupLpApys');

const getApys = [
  getRamenLpApys,
  getSaltLpApys,
  getApeApys,
  getSoupApys,
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