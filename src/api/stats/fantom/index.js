const getSpookyLpApys = require('./getSpookyLpApys');

const getApys = [
  getSpookyLpApys,
];

const getFantomApys = async () => {
  let apys = {};

  for (const getApy of getApys) {
    const apy = await getApy();
    apys = { ...apys, ...apy };
  }

  return apys;

};

module.exports = { getFantomApys };