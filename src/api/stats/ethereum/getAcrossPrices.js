import BigNumber from 'bignumber.js';
const pools = require('../../../data/ethereum/acrossPools.json');
const url = 'https://across.to/api/pools?token=';

const getAcrossPrices = async tokenPrices => {
  let prices = {};
  for (let i = 0; i < pools.length; ++i) {
    let pool = pools[i];
    try {
      const response = await fetch(url + pool.underlying.address).then(res => res.json());
      const exchangeRate = new BigNumber(response.exchangeRateCurrent);
      const underlyingPrice = tokenPrices[pool.underlying.symbol];
      const price = exchangeRate.times(underlyingPrice).dividedBy(1e18).toNumber();
      prices = { ...prices, [pool.name]: price };
    } catch (e) {
      console.log('Across url fetch error', e);
    }
  }

  return prices;
};

export default getAcrossPrices;
