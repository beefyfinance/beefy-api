const axios = require('axios');
const { lpTokenRatio } = require('./lpTokensRatio');
const { getNyanswopTokenPrice } = require('../api/stats/nyanswop/getNyanswopPrice')

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
    case 'bakery':
      price = await fetchBakery(id);
      break;
    case 'mirror':
      price = await fetchMirror(id);
      break;
    case 'nyanswop':
      price = await fetchNyanswop(id);
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

const fetchBakery = async id => {
  if (id !== 'BETH') return 0;
  try {
    const bakeryWbnbBethLp = '0x2fc2ad3c28560c97caca6d2dcf9b38614f48769a';
    const ratio = await lpTokenRatio(bakeryWbnbBethLp, '1e18', '1e18');
    const bnbPrice = await getPrice('pancake', 'WBNB');
    const bethPrice = bnbPrice / ratio;
    return bethPrice;
  } catch (err) {
    console.error(err);
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
    console.error(err);
    return 0;
  }
};

const fetchNyanswop = async (id) => {
  return await getNyanswopTokenPrice(id);
};

module.exports = {
  getPrice,
};
