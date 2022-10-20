import pools from '../../../data/avax/gmxPools.json';

const getGmxAvalanchePrices = async tokenPrices => {
  let prices = {};
  let promises = [];
  pools.forEach(pool => promises.push(getPrice(pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPrice = async (pool, tokenPrices) => {
  const price = getTokenPrice(tokenPrices, pool.tokenId);
  return { [pool.name]: price };
};

const getTokenPrice = (tokenPrices, oracleId) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};

export default getGmxAvalanchePrices;
