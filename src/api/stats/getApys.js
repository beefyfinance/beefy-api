const getCakePoolApy = require('./pancake/getCakePoolApy');
const { getCakeLpApys } = require('./pancake/getCakeLpApys');

const INTERVAL = 15 * 60 * 1000;

let apys = {};

const getApys = () => {
  return apys;
};

const updateApys = async () => {
  const values = await Promise.all([
    getCakePoolApy(),
    getCakeLpApys(),
  ]);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  console.log('> getApys');

  setTimeout(updateApys, INTERVAL);
};

updateApys();

module.exports = getApys;
