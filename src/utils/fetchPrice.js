const axios = require('axios');
const { API_BASE_URL } = require('../../constants');
const { lpTokenRatio } = require('./lpTokensRatio');
const { getAmmTokensPrices } = require('../api/stats/getAmmPrices');

const endpoints = {
  bakery: `${API_BASE_URL}/bakery/price`,
  bakeryLp: `${API_BASE_URL}/bakery/lps`,
  bdollarLp: `${API_BASE_URL}/bdollar/lps`,
  coingecko: `https://api.coingecko.com/api/v3/simple/price`,
  jetfuelLp: `${API_BASE_URL}/jetfuel/lps`,
  narwhalLp: `${API_BASE_URL}/narwhal/lps`,
  pancakeLp: `${API_BASE_URL}/pancake/lps`,
  pancake: `${API_BASE_URL}/pancake/price`,
  thugsLp: `${API_BASE_URL}/thugs/lps`,
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

const fetchMirror = async id => {
  try {
    let price = 0;

    const response = await axios({
      url: 'https://graph.mirror.finance/graphql',
      method: 'post',
      data: {
        query: `
        {
          assets {
            symbol
            prices {
              price
            }
          }
        }
        `,
      },
    });

    response.data.data.assets.forEach(asset => {
      if (asset.symbol === id) {
        price = Number(asset.prices.price);
      }
    });

    return price;
  } catch (err) {
    console.error('fetchMirror error:', err);
    return 0;
  }
};

const fetchBakery = async id => {
  if (id !== 'BETH') return 0;
  try {
    const bakeryWbnbBethLp = '0x2fc2ad3c28560c97caca6d2dcf9b38614f48769a';
    const ratio = await lpTokenRatio(bakeryWbnbBethLp, '1e18', '1e18');
    const bnbPrice = await fetchPrice({ oracle: 'pancake', id: 'WBNB' });
    const bethPrice = bnbPrice / ratio;
    return bethPrice;
  } catch (err) {
    console.error(err);
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
    case 'bakery':
      price = await fetchLP(id, endpoints.bakery);
      break;

    case 'bakery-lp':
      price = await fetchLP(id, endpoints.bakeryLp);
      break;

    case 'bdollar-lp':
      price = await fetchLP(id, endpoints.bdollarLp);
      break;

    case 'coingecko':
      price = await fetchCoingecko(id);
      break;

    case 'jetfuel-lp':
      price = await fetchLP(id, endpoints.jetfuelLp);
      break;

    case 'narwhal-lp':
      price = await fetchLP(id, endpoints.narwhalLp);
      break;

    case 'mdex':
    case 'nyanswop':
    case 'pancake':
      price = await fetchPancake(id);
      break;

    case 'pancake-lp':
      price = await fetchLP(id, endpoints.pancakeLp);
      break;

    case 'thugs-lp':
      price = await fetchLP(id, endpoints.thugsLp);
      break;

    case 'hardcode':
      price = id;
      break;

    case 'bakery':
      price = await fetchBakery(id);
      break;

    case 'mirror':
      price = await fetchMirror(id);
      break;

    default:
      price = 0;
  }

  addToCache({ oracle, id, price });
  return price;
};

module.exports = fetchPrice;
