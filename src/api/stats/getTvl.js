const getFantomTvl = require('./fantom/getFantomTvl.js');
const getMaticTvl = require('./matic/getMaticTvl.js');
const getHecoTvl = require('./heco/getHecoTvl.js');
const getAvaxTvl = require('./avax/getAvaxTvl.js');
const getBscTvl = require('./bsc/getBscTvl.js');

const INIT_DELAY = 30 * 1000;
const REFRESH_INTERVAL = 15 * 60 * 1000;

let tvl = {};

const getTvl = () => {
  return tvl;
};

const updateTvl = async () => {
  console.log('> updating tvl');

  try {
    const results = await Promise.allSettled([
      getMaticTvl(),
      getAvaxTvl(),
      getFantomTvl(),
      getBscTvl(),
      getHecoTvl(),
    ]);

    for (result of results) {
      if (result.status !== 'fulfilled') {
        continue;
      }
      tvl = { ...tvl, ...{ ...result.value } };
    }

    console.log('> updated tvl');
  } catch (err) {
    console.error('> tvl initialization failed', err);
  }

  setTimeout(updateTvl, REFRESH_INTERVAL);
};

setTimeout(updateTvl, INIT_DELAY);

module.exports = getTvl;
