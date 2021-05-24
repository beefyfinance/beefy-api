const getSpookyLpApys = require('./getSpookyLpApys');
const getFroyoLpApys = require('./getFroyoLpApys');
const getEsterApys = require('./getEsterApys');
const getSpookyBooApy = require('./getSpookyBooApy');

const getApys = [getSpookyLpApys, getFroyoLpApys, getEsterApys, getSpookyBooApy];

const getFantomApys = async () => {
  let apys = {};

  // let promises = [];
  // getApys.forEach(getApy => promises.push(getApy()));
  // const results = await Promise.allSettled(promises);
  //
  // for (const result of results) {
  //   if (result.status !== 'fulfilled') {
  //     console.warn('getFantomApys error', result.reason);
  //     continue;
  //   }
  //   apys = { ...apys, ...result.value };
  // }

  for (const getApy of getApys) {
    try {
      const apy = await getApy();
      apys = { ...apys, ...apy };
    } catch (e) {
      console.error('FantomApy error', getApy.name, e);
    }
  }

  return apys;
};

module.exports = { getFantomApys };
