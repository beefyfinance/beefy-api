const axios = require('axios');
const { API_BASE_URL } = require('../../constants');
const { lpTokenRatio } = require('./lpTokensRatio');
const { getAmmTokensPrices } = require('../api/stats/getAmmPrices');

const endpoints = {
  coingecko: `https://api.coingecko.com/api/v3/simple/price`,
  pancakeLp: `${API_BASE_URL}/pancake/lps`,
  pancake: `${API_BASE_URL}/pancake/price`,
};

const CACHE_TIMEOUT = 30 * 60 * 1000;
const cache = {};

const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const BUSD = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
const WBNB_BUSD = `${WBNB}_${BUSD}`;

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
  try {
    const response = await axios.get(endpoints.coingecko, {
      params: { ids: id, vs_currencies: 'usd' },
    });
    return response.data[id].usd;
  } catch (err) {
    console.error('fetchCoingecko error:', err);
    return 0;
  }
};

const fetchPancake = async id => {
  const cakePrices = await getAmmTokensPrices();
  return cakePrices[id] || 0;
};

const fetchLP = async (id, endpoint) => {
  try {
    const response = await axios.get(endpoint);
    return response.data[id];
  } catch (err) {
    console.error('fetchLP error:', id, err);
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
    case 'coingecko':
      price = await fetchCoingecko(id);
      break;

    case 'pancake':
      price = await fetchPancake(id);
      break;

    case 'pancake-lp':
      price = await fetchLP(id, endpoints.pancakeLp);
      break;

    default:
      price = 0;
  }

  addToCache({ oracle, id, price });
  return price;
};

module.exports = fetchPrice;
