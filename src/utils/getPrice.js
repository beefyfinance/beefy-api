const axios = require('axios');

const endpoints = {
  thugs: 'https://api.streetswap.vip/tickers',
  pancake: 'https://api.pancakeswap.finance/api/v1/price',
  coingecko: 'https://api.coingecko.com/api/v3/simple/price',
};

const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const BUSD = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
const WBNB_BUSD = `${WBNB}_${BUSD}`;

const CACHE_TIMEOUT = 30 * 60 * 1000;
const cache = {};

function isCached(oracle, id) {
  if (`${oracle}-${id}` in cache) {
    return cache[`${oracle}-${id}`].t + CACHE_TIMEOUT > Date.now();
  }
  return false;
}

function getCachedPrice(oracle, id) {
  return cache[`${oracle}-${id}`].price;
}

function addToCache(oracle, id, price) {
  cache[`${oracle}-${id}`] = { price: price, t: Date.now() };
}

const getPrice = async (oracle, id) => {
  if (oracle === undefined) {
    console.error('Undefined oracle');
    return 0;
  }
  if (id === undefined) {
    console.error('Undefined pair');
    return 0;
  }

  if (isCached(oracle, id)) {
    return getCachedPrice(oracle, id);
  }

  let price = 0;
  switch (oracle) {
    case 'pancake':
      price = await fetchPancake(id);
      break;
    case 'coingecko':
      price = await fetchCoingecko(id);
      break;
    case 'thugs':
      price = await fetchThugs(id);
      break;
    case 'hardcode':
      price = id;
      break;
    default:
      console.error('Unknown oracle:', oracle);
  }

  addToCache(oracle, id, price);
  return price;
};

const fetchPancake = async id => {
  try {
    const response = await axios.get(endpoints.pancake);
    return response.data.prices[id];
  } catch (err) {
    console.error(err);
    return 0;
  }
};

const fetchCoingecko = async id => {
  try {
    const response = await axios.get(endpoints.coingecko, {
      params: { ids: id, vs_currencies: 'usd' },
    });
    return response.data[id].usd;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

const fetchThugs = async id => {
  try {
    const response = await axios.get(endpoints.thugs);
    const ticker = response.data[id];
    const bnb = response.data[WBNB_BUSD]['last_price'];

    const pair = id.split('_');

    if (pair[0] === WBNB && pair[1] === BUSD) {
      price = bnb;
    } else if (pair[0] === WBNB) {
      price = bnb / ticker['last_price'];
    } else {
      price = bnb * ticker['last_price'];
    }

    return price;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

module.exports = {
  getPrice,
};
