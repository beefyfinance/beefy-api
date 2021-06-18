const getBeltPrices = require('./bsc/belt/getBeltPrices');
const getEllipsisPrices = require('./bsc/ellipsis/getEllipsisPrices');
const getSnob3PoolPrice = require('./avax/getSnob3PoolPrice');
const getFroyoPrices = require('./fantom/getFroyoPrices');
const getGondolaPrices = require('./avax/getGondolaPrices');
const getCurvePrices = require('./matic/getCurvePrices');
const getCurveFantomPrices = require('./fantom/getCurvePrices');
const getDopplePrices = require('./bsc/dopple/getDopplePrices');

const getNonAmmPrices = async tokenPrices => {
  let prices = {};

  const results = await Promise.allSettled([
    getBeltPrices(tokenPrices),
    getEllipsisPrices(),
    getSnob3PoolPrice(),
    getFroyoPrices(),
    getGondolaPrices(tokenPrices),
    getCurvePrices(),
    getCurveFantomPrices(),
    getDopplePrices(),
  ]);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getNonAmmPrices error', result.reason);
      continue;
    }
    prices = { ...prices, ...result.value };
  }

  return prices;
};

module.exports = getNonAmmPrices;
