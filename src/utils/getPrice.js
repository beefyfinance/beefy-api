const axios = require('axios');

const getPrice = async (oracle, oracleId) => {
  let price;

  if (oracle === 'pancake') {
    price = await getPancakeswapPrice(oracleId);
  } else if (oracle === 'coingecko') {
    price = await getCoingeckoPrice(oracleId);
  } else if (oracle === 'hardcode') {
    price = oracleId;
  }

  return price;
};

const getCoingeckoPrice = async id => {
  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
    params: {
      ids: id,
      vs_currencies: 'usd',
    },
  });
  return response.data[id].usd;
};

const getPancakeswapPrice = async id => {
  const response = await axios.get('https://api.pancakeswap.finance/api/v1/price');
  return response.data.prices[id];
};

module.exports = {
  getPrice,
};
