export const fetchDefillamaPrices = async coins => {
  if (!coins) return {};
  const ids = coins.map(id => `coingecko:${id}`).join(',');
  const url = `https://coins.llama.fi/prices/current/${ids}`;
  let prices = {};
  try {
    const data = await fetch(url).then(res => res.json());
    Object.keys(data.coins).forEach(coin => {
      const id = coin.split('coingecko:')[1];
      const price = Number(data.coins[coin].price);
      prices = { ...prices, ...{ [id]: price } };
    });
  } catch (e) {
    console.error('> fetchDefillamaPrices', e);
  }
  return prices;
};
