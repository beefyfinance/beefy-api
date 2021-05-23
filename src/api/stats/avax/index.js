const getLydLpApys = require('./getLydLpApys');
const getOliveLpApys = require('./getOliveLpApys');
const getPangolinApys = require('./getPangolinLpApys');
const getSnobLpApys = require('./getSnobLpApys');
const getGondolaLpApys = require('./getGondolaLpApys');
const getComAvaxApys = require('./getComAvaxLpApys');

const getApys = [
  getComAvaxApys,
  getLydLpApys,
  getPangolinApys,
  getSnobLpApys,
  getOliveLpApys,
  getGondolaLpApys,
];

const getAvaxApys = async () => {
  let apys = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const values = await Promise.all(promises);

  for (const item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

module.exports = { getAvaxApys };
