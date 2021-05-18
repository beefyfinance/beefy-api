const getBifiMaxiApy = require('./beefy/getBifiMaxiApy');
const getComAvaxApys = require('./complus/getComAvaxLpApys');
const getComBscApys = require('./complus/getComBscLpApys');
const getMdexBscLpApys = require('./mdex/getMdexBscLpApys');
const { getAvaxApys } = require('./avax');
const { getMaticApys } = require('./matic');
const { getHecoApys } = require('./heco');
const { getFantomApys } = require('./fantom');
const { getBSCApys } = require('./bsc');

const INIT_DELAY = 30 * 1000;
const REFRESH_INTERVAL = 15 * 60 * 1000;

let apys = {};

const getApys = () => {
  return apys;
};

const updateApys = async () => {
  console.log('> updating apys');

  try {
    const results = await Promise.allSettled([
      getBifiMaxiApy(),
      getMdexBscLpApys(),
      getComAvaxApys(),
      getComBscApys(),
      getMaticApys(),
      getAvaxApys(),
      getFantomApys(),
      getHecoApys(),
      getBSCApys(),
    ]);

    for (result of results) {
      if (result.status !== 'fulfilled') {
        continue;
      }
      apys = { ...apys, ...result.value };
    }

    console.log('> updated apys');
  } catch (err) {
    console.error('> apy initialization failed', err);
  }

  setTimeout(updateApys, REFRESH_INTERVAL);
};

setTimeout(updateApys, INIT_DELAY);

module.exports = getApys;
