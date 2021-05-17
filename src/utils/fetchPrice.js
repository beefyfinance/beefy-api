const axios = require('axios');
const { getAmmTokenPrice, getAmmLpPrice } = require('../api/stats/getAmmPrices');

const CACHE_TIMEOUT = 10 * 60 * 1000;
const cache = {};

function isCached({ oracle, id }) {
  if (`${oracle}-${id}` in cache) {
    return cache[`${oracle}-${id}`].t + CACHE_TIMEOUT > Date.now();
  }
  return false;
}

function getCachedPrice({ oracle, id }) {
  return cache[`${oracle}-${id}`].price;
}

function addToCache({ oracle, id, price }) {
  cache[`${oracle}-${id}`] = { price: price, t: Date.now() };
}

const fetchCoingecko = async id => {
  console.warn('coingecko is deprecated');
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: id, vs_currencies: 'usd' },
    });
    return response.data[id].usd;
  } catch (err) {
    console.error('fetchCoingecko error:', err);
    return 0;
  }
};

const fetchPrice = async ({ oracle, id }) => {
  if (oracle === undefined) {
    console.error('Undefined oracle');
    return 0;
  }
  if (id === undefined) {
    console.error('Undefined pair');
    return 0;
  }

  if (isCached({ oracle, id })) {
    return getCachedPrice({ oracle, id });
  }

  let price = 0;
  switch (oracle) {
    case 'lps':
      price = await getAmmLpPrice(id);
      break;

    case 'tokens':
      price = await getAmmTokenPrice(id);
      break;

    case 'coingecko':
      price = await fetchCoingecko(id);
      break;

    case 'hardcode':
      price = id;
      break;

    default:
      throw new Error(`Oracle '${oracle}' not implemented`);
  }

  addToCache({ oracle, id, price });
  return price;
};

module.exports = fetchPrice;
