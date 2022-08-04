const fetch = require('node-fetch');

export async function fetchCoinGeckoPrices(coins: string[]) {
  if (!coins) return {};
  const ids = coins.join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
  let prices: Record<string, number> = {};
  try {
    const data = await fetch(url).then(res => res.json());
    Object.keys(data).forEach(coin => {
      const price = Number(data[coin].usd);
      prices = { ...prices, ...{ [coin]: price } };
    });
  } catch (e) {
    console.error('> fetchCoinGeckoPrices', e);
  }
  return prices;
}
