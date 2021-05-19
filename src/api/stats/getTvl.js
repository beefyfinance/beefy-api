const getBeltTvl = require('./bsc/belt/getBeltTvl.js');

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
      /*getBifiMaxiApy(),
      getMdexBscLpApys(),
      getComAvaxApys(),*/
      getBeltTvl(),
      /*getMaticApys(),
      getAvaxApys(),
      getFantomApys(),
      getHecoApys(),
      getBSCApys(),*/
    ]);

    for (result of results) {
      if (result.status !== 'fulfilled') {
        continue;
      }
      tvl = { ...tvl, ...result.value };
    }

    console.log('> updated tvl');
  } catch (err) {
    console.error('> tvl initialization failed', err);
  }

  setTimeout(updateTvl, REFRESH_INTERVAL);
};

setTimeout(updateTvl, INIT_DELAY);

module.exports = getTvl;
