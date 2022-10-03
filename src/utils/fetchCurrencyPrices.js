const fetch = require('node-fetch');

const fetchCurrencyPrices = async currencies => {
  if (!currencies) return {};
  const ids = currencies.join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=${currencies}`;
  let prices = {};
  try {
    const data = await fetch(url).then(res => res.json());
    Object.keys(data['usd-coin']).forEach(currencies => {
      const price = Number(data['usd-coin'][currencies]);
      const inversePrice = price > 0 ? 1 / price : 0;
      prices = { ...prices, ...{ [currencies]: inversePrice } };
    });
  } catch (e) {
    console.error('> fetchCurrencyPrices', e);
  }
  return prices;
};

module.exports = { fetchCurrencyPrices };
