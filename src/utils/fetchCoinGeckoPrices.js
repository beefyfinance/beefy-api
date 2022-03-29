const axios = require('axios');

const fetchCoinGeckoPrices = async coins => {
  if (!coins) return {};
  const ids = coins.map(c => c.id).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
  let prices = {};
  try {
    const response = await axios.get(url);
    const data = response.data;
    for (const coin of coins) {
      const price = Number(data[coin.id].usd);
      prices = { ...prices, ...{ [coin.id]: price, [coin.symbol]: price } };
    }
  } catch (e) {
    console.error('> fetchCoinGeckoPrices', e);
  }
  return prices;
};

module.exports = { fetchCoinGeckoPrices };
