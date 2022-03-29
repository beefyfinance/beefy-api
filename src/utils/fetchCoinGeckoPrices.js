const axios = require('axios');

const fetchCoinGeckoPrices = async coins => {
  if (!coins) return {};
  const ids = coins.join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
  let prices = {};
  try {
    const response = await axios.get(url);
    const data = response.data;
    Object.keys(data).forEach(coin => {
      const price = Number(data[coin].usd);
      prices = { ...prices, ...{ [coin]: price } };
    });
  } catch (e) {
    console.error('> fetchCoinGeckoPrices', e);
  }
  return prices;
};

module.exports = { fetchCoinGeckoPrices };
