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
import getCurveOptimismPrices from './optimism/getCurvePrices';
import getCurveMoonbeamPrices from './moonbeam/getCurvePrices';
import { getCurveEthereumPrices } from './ethereum/getCurvePrices';
import getBeethovenxPrices from './fantom/getBeethovenxPrices';
import { getSynapsePrices } from './avax/getSynapsePrices';
import getJarvisPrices from './matic/getJarvisPrices';
import getSolarbeamPrices from './moonriver/getSolarbeamPrices';
import getRosePrices from './aurora/getRosePrices';
import getStellaswapPrices from './moonbeam/getStellaswapPrices';
import getBeetsOPPrices from './optimism/getBeetsOPPrices';
import getBalancerArbPrices from './arbitrum/getBalancerArbPrices';
import getBalancerPolyPrices from './matic/getBalancerPolyPrices';
import getVelodromeStablePrices from './optimism/getVelodromeStablePrices';
import getDystopiaStablePrices from './matic/getDystopiaStablePrices';
import getSolidlyV1StablePrices from './fantom/getSolidlyV1StablePrices';
import getVoltagePrices from './fuse/getVoltagePrices';
import getBeamswapPrices from './moonbeam/getBeamswapPrices';
import getTrisolarisPrices from './aurora/getTrisolarisPrices';
import getConeStablePrices from './bsc/getConeStablePrices';
import getSpiritStablePrices from './fantom/getSpiritStablePrices';
import getHermesStablePrices from './metis/getHermesStablePrices';
import getCakeStablePrices from './bsc/pancake/getCakeStablePrices';
import getUniV3PolygonPrices from './matic/getUniV3PolygonPrices';
import getCurveKavaPrices from './kava/getCurvePrices';
import getSushiKavaPrices from './kava/getSushiPrices';
import getGmxArbitrumPrices from './arbitrum/getGmxPrices';
import getGmxAvalanchePrices from './avax/getGmxPrices';
import getAuraBalancerPrices from './ethereum/getAuraBalancerPrices';
import getFerroPrices from './cronos/getFerroPrices';
import getHopArbPrices from './arbitrum/getHopArbPrices';
import getHopOpPrices from './optimism/getHopOpPrices';
import getHopPolyPrices from './matic/getHopPolyPrices';
import getOlpPrices from './optimism/getOlpPrices';
import getEqualizerStablePrices from './fantom/getEqualizerStablePrices';

const getNonAmmPrices = async tokenPrices => {
  let prices = {};
  let breakdown = {};

  const promises = [
    getEqualizerStablePrices(tokenPrices),
    getOlpPrices(),
    getHopPolyPrices(tokenPrices),
    getHopOpPrices(tokenPrices),
    getHopArbPrices(tokenPrices),
    getFerroPrices(tokenPrices),
    getCurveEthereumPrices(tokenPrices),
    getAuraBalancerPrices(tokenPrices),
    getGmxAvalanchePrices(tokenPrices),
    getGmxArbitrumPrices(tokenPrices),
    getSushiKavaPrices(tokenPrices),
    getUniV3PolygonPrices(tokenPrices),
    getHermesStablePrices(tokenPrices),
    getCakeStablePrices(tokenPrices),
    getSpiritStablePrices(tokenPrices),
    getConeStablePrices(tokenPrices),
    getTrisolarisPrices(tokenPrices),
    getBeamswapPrices(tokenPrices),
    getVoltagePrices(tokenPrices),
    getSolidlyV1StablePrices(tokenPrices),
    getDystopiaStablePrices(tokenPrices),
    getVelodromeStablePrices(tokenPrices),
    getBalancerPolyPrices(tokenPrices),
    getBalancerArbPrices(tokenPrices),
    getBeethovenxPrices(tokenPrices),
    getBeetsOPPrices(tokenPrices),
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
    getCurveOptimismPrices(tokenPrices),
    getCurveMoonbeamPrices(tokenPrices),
    getCurveKavaPrices(tokenPrices),
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
