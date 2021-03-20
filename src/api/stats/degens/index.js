const getRamenLpApys = require('../ramen/getRamenLpApys');
const getBlizzardLpApys = require('./getBlizzardLpApys')
const getSaltLpApys = require('./getSaltLpApys');
const getApeApys = require('./getApeLpApys');
const getApeBananaApys = require('./getApeBananaApy');
const getSoupApys = require('./getSoupLpApys');
const getMemeFarmApys = require('./getMemeFarmLpApys');
const getSquirrelApys = require('./getSquirrelLpApys');
const getSlimeApys = require('./getSlimeLpApys');

const getApys = [
  getRamenLpApys,
  getBlizzardLpApys,
  getSaltLpApys,
  getApeApys,
  getApeBananaApys,
  getSoupApys,
  getMemeFarmApys,
  getSquirrelApys,
  getSlimeApys
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