const getSpookyLpApys = require('./getSpookyLpApys');
const getFroyoLpApys = require('./getFroyoLpApys');
const getEsterApys = require('./getEsterApys');
const getSpookyBooApy = require('./getSpookyBooApy');

const getApys = [getSpookyLpApys, getFroyoLpApys, getEsterApys, getSpookyBooApy];

const getFantomApys = async () => {
  let apys = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const values = await Promise.all(promises);

  for (const item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

module.exports = { getFantomApys };
