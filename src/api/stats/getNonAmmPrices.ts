'use strict';

import getBeltPrices from './bsc/belt/getBeltPrices';
import getEllipsisPrices from './bsc/ellipsis/getEllipsisPrices';
import getSnob3PoolPrice from './avax/getSnob3PoolPrice';
import getFroyoPrices from './fantom/getFroyoPrices';
import getGondolaPrices from './avax/getGondolaPrices';
import getCurvePolygonPrices from './matic/getCurvePrices';
import getCurveFantomPrices from './fantom/getCurvePrices';
import getDopplePrices from './bsc/dopple/getDopplePrices';

const getNonAmmPrices = async tokenPrices => {
  let prices = {};

  const promises = [
    getBeltPrices(tokenPrices),
    getEllipsisPrices(),
    getSnob3PoolPrice(),
    getFroyoPrices(),
    getGondolaPrices(tokenPrices),
    getCurvePolygonPrices(tokenPrices),
    getCurveFantomPrices(tokenPrices),
    getDopplePrices(),
  ];

  // Setup error logs
  promises.forEach(p => p.catch(e => console.warn('getNonAmmPrices error', e)));

  const results = await Promise.allSettled(promises);

  results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .forEach(r => {
      Object.assign(prices, r.value);
    });

  return prices;
};

export default getNonAmmPrices;
