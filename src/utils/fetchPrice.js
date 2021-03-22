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

    case 'lps':
    case 'bakery-lp':
    case 'bdollar-lp':
    case 'jetfuel-lp':
    case 'narwhal-lp':
    case 'thugs-lp':
      price = await getAmmLpPrice(id);
      break;

    case 'thugs':
    case 'bakery':
    case 'mdex':
    case 'pangolin':
    case 'hyper':
    case 'nyanswop':
    case 'julswap':
    case 'pancake':
      price = await getAmmTokenPrice(id);
      break;

    case 'hardcode':
      price = id;
      break;

    case 'mirror':
      price = await fetchMirror(id);
      break;

    default:
      throw new Error(`Oracle '${oracle}' not implemented`)
  }

  addToCache({ oracle, id, price });
  return price;
};

module.exports = fetchPrice;
