// import getBeltPrices from './bsc/belt/getBeltPrices';
// import getEllipsisPrices from './bsc/ellipsis/getEllipsisPrices';
import getBombMaxiPrices from './bsc/bombfarm/getBombMaxiPrices';

// import getSnob3PoolPrice from './avax/getSnob3PoolPrice';
// import getFroyoPrices from './fantom/getFroyoPrices';
// import getGondolaPrices from './avax/getGondolaPrices';
// import getCurvePolygonPrices from './matic/getCurvePrices';
// import getCurveFantomPrices from './fantom/getCurvePrices';
// import getDopplePrices from './bsc/dopple/getDopplePrices';
// import { getIronSwapPrices } from './matic/getIronSwapPrices';
//import getAlpacaIbPrices from './bsc/alpaca/getAlpacaIbPrices';
//import getBombAcsiPrices from './bsc/bombfarm/getBombAcsiPrices'

// import getCurveArbitrumPrices from './arbitrum/getCurvePrices';
// import getCurveAvaxPrices from './avax/getCurvePrices';
// import getCurveHarmonyPrices from './one/getCurvePrices';
// import getBeethovenxPrices from './fantom/getBeethovenxPrices';
// import { getSynapsePrices } from './avax/getSynapsePrices';

const getNonAmmPrices = async tokenPrices => {
  let prices = {};

  const promises = [
    getBombMaxiPrices(tokenPrices),
    // getBeethovenxPrices(tokenPrices),
    // getBeltPrices(tokenPrices),
    // getEllipsisPrices(),
    //getBombAcsiPrices(tokenPrices),
    // getSnob3PoolPrice(),
    // getFroyoPrices(),
    // getGondolaPrices(tokenPrices),
    // getCurvePolygonPrices(tokenPrices),
    // getCurveFantomPrices(tokenPrices),
    // getCurveArbitrumPrices(tokenPrices),
    // getCurveAvaxPrices(tokenPrices),
    // getCurveHarmonyPrices(tokenPrices),
    // getDopplePrices(),
    // getIronSwapPrices(),
    //  getAlpacaIbPrices(tokenPrices),
    // getSynapsePrices(),
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
