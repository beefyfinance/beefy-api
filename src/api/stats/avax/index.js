const getLydLpApys = require('./getLydLpApys');
const getOliveLpApys = require('./getOliveLpApys');
const getPangolinApys = require('./getPangolinLpApys');
const getSnobLpApys = require('./getSnobLpApys');


const getApys = [
  getLydLpApys,
  getPangolinApys,
  getSnobLpApys,
  getOliveLpApys,
];

const getAvaxApys = async () => {
  let apys = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;

};

module.exports = { getAvaxApys };