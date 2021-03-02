const getSaltLpApys = require('./getSaltLpApys');
const getRamenLpApys = require('../ramen/getRamenLpApys');

const getApys = [
  getRamenLpApys,
  getSaltLpApys,
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