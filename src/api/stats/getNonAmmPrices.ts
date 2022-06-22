import getBeltPrices from './bsc/belt/getBeltPrices';
import getEllipsisPricesOld from './bsc/ellipsis/getEllipsisPricesOld';
import { getEllipsisPrices } from './bsc/getEllipsisPrices';
import getSnob3PoolPrice from './avax/getSnob3PoolPrice';
import getFroyoPrices from './fantom/getFroyoPrices';
import getGondolaPrices from './avax/getGondolaPrices';
import getCurvePolygonPrices from './matic/getCurvePrices';
import getCurveFantomPrices from './fantom/getCurvePrices';
import getDopplePrices from './bsc/dopple/getDopplePrices';
import { getIronSwapPrices } from './matic/getIronSwapPrices';
import getAlpacaIbPrices from './bsc/alpaca/getAlpacaIbPrices';
import getCurveArbitrumPrices from './arbitrum/getCurvePrices';
import getCurveAvaxPrices from './avax/getCurvePrices';
import getCurveHarmonyPrices from './one/getCurvePrices';
import getBeethovenxPrices from './fantom/getBeethovenxPrices';
import { getSynapsePrices } from './avax/getSynapsePrices';
import getJarvisPrices from './matic/getJarvisPrices';
import getSolarbeamPrices from './moonriver/getSolarbeamPrices';
import getRosePrices from './aurora/getRosePrices';
import getStellaswapPrices from './moonbeam/getStellaswapPrices';

const getNonAmmPrices = async tokenPrices => {
  let prices = {};
  let breakdown = {};

  const promises = [
    getBeethovenxPrices(tokenPrices),
    getBeltPrices(tokenPrices),
    getEllipsisPricesOld(),
    getEllipsisPrices(tokenPrices),
    getSnob3PoolPrice(),
    getFroyoPrices(),
    getGondolaPrices(tokenPrices),
    getCurvePolygonPrices(tokenPrices),
    getCurveFantomPrices(tokenPrices),
    getCurveArbitrumPrices(tokenPrices),
    getCurveAvaxPrices(tokenPrices),
    getCurveHarmonyPrices(tokenPrices),
    getRosePrices(tokenPrices),
    getDopplePrices(),
    getIronSwapPrices(),
    getAlpacaIbPrices(tokenPrices),
    getSynapsePrices(),
    getJarvisPrices(tokenPrices),
    getSolarbeamPrices(tokenPrices),
    getStellaswapPrices(tokenPrices),
  ];

  // Setup error logs
  promises.forEach(p => p.catch(e => console.warn('getNonAmmPrices error', e)));

  const results = await Promise.allSettled(promises);

  results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .forEach(r => {
      Object.keys(r.value).forEach(lp => {
        if (typeof r.value[lp] === 'object') {
          let lpData = r.value[lp];
          prices[lp] = lpData.price;
          breakdown[lp] = lpData;
        } else {
          prices[lp] = r.value[lp];
          breakdown[lp] = {
            price: r.value[lp],
          };
        }
      });
    });

  return { prices, breakdown };
};

export default getNonAmmPrices;
