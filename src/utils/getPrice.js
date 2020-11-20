const axios = require('axios');

const endpoints = {
  thugs:     'https://api.streetswap.vip/tickers',
  pancake:   'https://api.pancakeswap.finance/api/v1/price',
  coingecko: 'https://api.coingecko.com/api/v3/simple/price',
};

const CACHE_TIMEOUT = 30 * 60 * 1000;
const cache = {};

function isCached({oracle, id}) {
  if (`${oracle}-${id}` in cache) {
    return cache[`${oracle}-${id}`].t + CACHE_TIMEOUT > Date.now();
  }
  return false;
}

function getCachedPrice({oracle, id}) {
  return cache[`${oracle}-${id}`].price;
}

function addToCache({oracle, id, price}) {
  cache[`${oracle}-${id}`] = {price: price, t: Date.now()};
}

const getPrice = async (oracle, id) => {
  if (oracle === undefined) { console.error('Undefined oracle'); return 0; }
  if (id === undefined) { console.error('Undefined pair'); return 0; }

  if (isCached({oracle, id})){
    return getCachedPrice({oracle, id});
  }
  
  let price = 0;
  switch(oracle) {
    case 'pancake':    price = await fetchPancake(id); break;
    case 'coingecko':  price = await fetchCoingecko(id); break;
    case 'thugs':      price = await fetchThugs(id); break;
    case 'hardcode':   price = id; break;
    default: console.error('Unknown oracle:', oracle);
  }

  addToCache({oracle, id, price});
  return price;
};

const fetchPancake = async (id) => {
  try {
    const response = await axios.get(endpoints.pancake);
    return response.data.prices[id];
  } catch (err) {
    console.error(err);
    return 0;
  }
};

const fetchCoingecko = async (id) => {
  try {
    const response = await axios.get(endpoints.coingecko, {
      params: {ids: id, vs_currencies: 'usd' }
    });
    return response.data[id].usd;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

const fetchPancake = async (id) => {
  try {
    const response = await axios.get(endpoints.thugs);
    return response.data.prices[id];
  } catch (err) {
    console.error(err);
    return 0;
  }
};

module.exports = {
  getPrice,
};
