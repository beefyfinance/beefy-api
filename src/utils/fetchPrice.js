const axios = require('axios');
const { lpTokenRatio } = require('./lpTokensRatio');
const { getNyanswopTokenPrice } = require('../api/stats/nyanswop/getNyanswopPrice');
const { getCakeTokensPrices } = require('../api/stats/pancake/getCakePrices');

const endpoints = {
  bakery: 'https://api.beefy.finance/bakery/price',
  bakeryLp: 'https://api.beefy.finance/bakery/lps',
  bdollarLp: 'https://api.beefy.finance/bdollar/lps',
  coingecko: 'https://api.coingecko.com/api/v3/simple/price',
  jetfuelLp: 'https://api.beefy.finance/jetfuel/lps',
  narwhalLp: 'https://api.beefy.finance/narwhal/lps',
  pancakeLp: 'https://api.beefy.finance/pancake/lps',
  // thugsLp: 'https://api.beefy.finance/thugs/lps',
  // thugs: 'https://api.beefy.finance/thugs/tickers',
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
    console.error(err);
    return 0;
  }
};

const fetchPancake = async (id, oracle) => {
  const cakePrices = await getCakeTokensPrices();
  return cakePrices[id] || 0;
};

// FIXME: restoring partial service
// const fetchThugs = async id => {
//   try {
//     const response = await axios.get(endpoints.thugs);
//     const ticker = response.data[id];
//     const bnb = response.data[WBNB_BUSD]['last_price'];

//     let price = 0;

//     const pair = id.split('_');
//     if (pair[0] === WBNB && pair[1] === BUSD) {
//       price = bnb;
//     } else if (pair[0] === WBNB) {
//       price = bnb / ticker['last_price'];
//     } else {
//       price = bnb * ticker['last_price'];
//     }

//     return price;
//   } catch (err) {
//     console.error(err);
//     return 0;
//   }
// };

const fetchLP = async (id, endpoint) => {
  try {
    const response = await axios.get(endpoint);
    return response.data[id];
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

const fetchNyanswop = async id => {
  return await getNyanswopTokenPrice(id);
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

    case 'pancake':
      price = await fetchPancake(id);
      break;

    case 'pancake-lp':
      price = await fetchLP(id, endpoints.pancakeLp);
      break;

    // FIXME: restoring partial service
    // case 'thugs':
    //   price = await fetchThugs(id);
    //   break;

    // case 'thugs-lp':
    //   price = await fetchLP(id, endpoints.thugsLp);
    //   break;

    case 'hardcode':
      price = id;
      break;

    case 'mirror':
      price = await fetchMirror(id);
      break;

    case 'nyanswop':
      price = await fetchNyanswop(id);
      break;

    default:
      price = 0;
  }

  addToCache({ oracle, id, price });
  return price;
};

module.exports = fetchPrice;
