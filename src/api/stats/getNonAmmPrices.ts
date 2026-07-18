import getCurvePolygonPrices from './matic/getCurvePrices.js';
import getCurveArbitrumPrices from './arbitrum/getCurvePrices.js';
import getCurveOptimismPrices from './optimism/getCurvePrices.js';
import { getCurveEthereumPrices } from './ethereum/getCurvePrices.js';
import getBeetsOPPrices from './optimism/getBeetsOPPrices.ts';
import getBalancerArbPrices from './arbitrum/getBalancerArbPrices.ts';
import getBalancerAvaxPrices from './avax/getBalancerPrices.js';
import getBalancerBasePrices from './base/getBalancerPrices.ts';
import getBalancerMonadPrices from './monad/getBalancerMonadPrices.ts';
import getBeetsSonicPrices from './sonic/getBeetsSonicPrices.js';
import getVelodromeStablePrices from './optimism/getVelodromeStablePrices.js';
import { getGmxArbitrumPrices } from './arbitrum/getGmxPrices.ts';
import { getGmxAvalanchePrices } from './avax/getGmxPrices.ts';
import getAuraBalancerPrices from './ethereum/getAuraBalancerPrices.ts';
import { getCurveBasePrices } from './base/getCurvePrices.js';
import getUniswapEthereumPrices from './ethereum/getUniswapPositionPrices.ts';
import getAerodromePositionPrices from './base/getAerodromePositionPrices.ts';
import { getAerodromeStablePrices } from './base/getAerodromeStablePrices.js';
import getBalancerGnosisPrices from './gnosis/getBalancerGnosisPrices.js';
import getCurvePricesCommon from './common/curve/getCurvePricesCommon.js';
import { getCurveLendPricesCommon } from './common/curve/getCurveLendPricesCommon.js';
import getVelodromeLiskStablePrices from './lisk/getVelodromeLiskStablePrices.js';
import { getKodiakPrices } from './berachain/getKodiakPrices.js';
import { getSiloPrices } from './common/getSiloPrices.ts';
import {
  ARBITRUM_CHAIN_ID as ARB_CHAIN_ID,
  AVAX_CHAIN_ID,
  BASE_CHAIN_ID,
  ETH_CHAIN_ID,
  FRAXTAL_CHAIN_ID as FRX_CHAIN_ID,
  MANTLE_CHAIN_ID,
  MEGAETH_CHAIN_ID,
  MONAD_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
  PLASMA_CHAIN_ID,
  POLYGON_CHAIN_ID,
  SONIC_CHAIN_ID,
} from '../../constants.ts';
import getSolidlyStablePrices from './common/getSolidlyStablePrices.js';
import getGammaLineaPrices from './linea/getGammaPrices.js';
import { getMimSwapPrices } from './arbitrum/getMimSwapPrices.js';
import { getBeefyCowArbPrices } from './arbitrum/getBeefyCowArbPrices.ts';
import { getBeefyCowOPPrices } from './optimism/getBeefyCowOPPrices.ts';
import { getBeefyCowBasePrices } from './base/getBeefyCowBasePrices.ts';
import { getBeefyCowLineaPrices } from './linea/getBeefyLineaCowPrices.ts';
import { getBeefyCowPolyPrices } from './matic/getBeefyPolyCowPrices.ts';
import { getBeefyCowZkSyncPrices } from './zksync/getBeefyCowZkSyncPrices.ts';
import { getBeefyCowMantlePrices } from './mantle/getBeefyMantleCowPrices.ts';
import { getBeefyCowSeiPrices } from './sei/getBeefySeiCowPrices.ts';
import { getBeefyCowBscPrices } from './bsc/getBeefyCowBscPrices.ts';
import { getBeefyCowAvaxPrices } from './avax/getBeefyCowAvaxPrices.ts';
import { getBeefyCowRootstockPrices } from './rootstock/getBeefyRootstockCowPrices.ts';
import { getBeefyCowScrollPrices } from './scroll/getBeefyScrollCowPrices.ts';
import { getBeefyCowLiskPrices } from './lisk/getBeefyLiskCowPrices.ts';
import { getBeefyCowBerachainPrices } from './berachain/getBeefyBerachainCowPrices.ts';
import { getBeefyCowGnosisPrices } from './gnosis/getBeefyGnosisCowPrices.ts';
import { getBeefyCowHyperevmPrices } from './hyperevm/getBeefyHyperevmCowPrices.ts';
import { getBeefyCowPlasmaPrices } from './plasma/getBeefyPlasmaCowPrices.ts';
import { getBeefyCowMonadPrices } from './monad/getBeefyMonadCowPrices.ts';
import { getBeefyCowMegaethPrices } from './megaeth/getBeefyMegaethCowPrices.ts';
import { getBeefyCowRobinhoodPrices } from './robinhood/getBeefyRobinhoodCowPrices.ts';
import { getBeefyCowEthereumPrices } from './ethereum/getBeefyCowEthereumPrices.ts';
import { getPendleCommonPrices } from './common/getPendleCommonPrices.js';
import { getMellowVeloPrices } from './common/getMellowVeloPrices.js';
import { getBunniPrices } from './common/getBunniPrices.js';
import { getBeefyCowSonicPrices } from './sonic/getBeefySonicCowPrices.ts';
import { getMorphoPrices } from './common/morpho/getMorphoPrices.js';
import { getAaveV3Prices } from './common/aave/getAaveV3Prices.js';
import { getAaveV4Prices } from './common/aave/getAaveV4Prices.ts';
import { getIchiPrices } from './common/getIchiPrices.js';
import { getEulerPrices } from './common/euler/getEulerPrices.js';
import { getCurvanceMonadPrices } from './monad/getCurvanceMonadPrices.ts';
import { getNeverlandPrices } from './monad/getNeverlandPrices.ts';
import { getGearboxPrices } from './common/gearbox/getGearboxPrices.js';
import { promiseArrayTiming } from '../../utils/timing.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';
import ethereumAaveV4Pools from '../../data/ethereum/aaveV4Pools.json' with { type: "json" };
import baseAaveV3Pools from '../../data/base/aaveV3Pools.json' with { type: "json" };
import mantleAaveV3Pools from '../../data/mantle/aaveV3Pools.json' with { type: "json" };
import megaethAaveV3Pools from '../../data/megaeth/aaveV3Pools.json' with { type: "json" };
import monadAaveV3Pools from '../../data/monad/aaveV3Pools.json' with { type: "json" };
import monadGearboxPools from '../../data/monad/gearboxPools.json' with { type: "json" };
import ethereumCurveLendPools from '../../data/ethereum/curveLendPools.json' with { type: "json" };
import fraxtalCurveLendPools from '../../data/fraxtal/curveLendPools.json' with { type: "json" };
import fraxtalCurvePools from '../../data/fraxtal/curvePools.json' with { type: "json" };
import plasmaCurvePools from '../../data/plasma/curvePools.json' with { type: "json" };
import monadCurvePools from '../../data/monad/curvePools.json' with { type: "json" };
import ethereumPendlePools from '../../data/ethereum/pendlePools.json' with { type: "json" };
import ethereumPendleUnboostedPools from '../../data/ethereum/pendleUnboostedPools.json' with { type: "json" };
import baseMellowAeroPools from '../../data/base/mellowAeroPools.json' with { type: "json" };
import baseAlienBaseBunniPools from '../../data/base/alienBaseBunniPools.json' with { type: "json" };
import baseMorphoPools from '../../data/base/morphoPools.json' with { type: "json" };
import ethereumMorphoPools from '../../data/ethereum/morphoPools.json' with { type: "json" };
import maticMorphoPools from '../../data/matic/morphoPools.json' with { type: "json" };
import monadMorphoPools from '../../data/monad/morphoPools.json' with { type: "json" };
import arbitrumMorphoPools from '../../data/arbitrum/morphoPools.json' with { type: "json" };
import optimismMorphoPools from '../../data/optimism/morphoPools.json' with { type: "json" };
import sonicSwapxIchiPools from '../../data/sonic/swapxIchiPools.json' with { type: "json" };
import monadEulerPools from '../../data/monad/eulerPools.json' with { type: "json" };
import avaxBlackStableLpPools from '../../data/avax/blackStableLpPools.json' with { type: "json" };
import plasmaLithosStablePools from '../../data/plasma/lithosStablePools.json' with { type: "json" };
import avaxSiloPools from '../../data/avax/siloPools.json' with { type: "json" };

const logger = getLoggerFor({ module: 'prices' });

export type NonAmmPrices = {
  prices: Record<string, number>;
  breakdown: Record<
    string,
    {
      price: number;
      tokens: string[];
      balances: string[];
      totalSupply: string;
    }
  >;
};

export async function getNonAmmPrices(
  tokenPrices: Record<string, number>,
  ammPrices: Record<string, number>
): Promise<NonAmmPrices> {
  let prices = {};
  let breakdown = {};

  const promises = [
    getAaveV4Prices(ETH_CHAIN_ID, ethereumAaveV4Pools, tokenPrices),
    getAaveV3Prices(BASE_CHAIN_ID, baseAaveV3Pools, tokenPrices),
    getAaveV3Prices(MANTLE_CHAIN_ID, mantleAaveV3Pools, tokenPrices),
    getAaveV3Prices(MEGAETH_CHAIN_ID, megaethAaveV3Pools, tokenPrices),
    getAaveV3Prices(MONAD_CHAIN_ID, monadAaveV3Pools, tokenPrices),
    getGearboxPrices(MONAD_CHAIN_ID, monadGearboxPools, tokenPrices),
    getNeverlandPrices(tokenPrices),
    getCurvanceMonadPrices(tokenPrices),
    getUniswapEthereumPrices(tokenPrices),
    getMimSwapPrices(tokenPrices),
    getAuraBalancerPrices(tokenPrices),
    getGmxAvalanchePrices(tokenPrices),
    getGmxArbitrumPrices(tokenPrices),
    getVelodromeStablePrices(tokenPrices),
    getVelodromeLiskStablePrices(tokenPrices),
    getAerodromeStablePrices(tokenPrices),
    getBalancerAvaxPrices(tokenPrices),
    getBalancerBasePrices(tokenPrices),
    getBalancerArbPrices(tokenPrices),
    getBalancerGnosisPrices(tokenPrices),
    getBalancerMonadPrices(tokenPrices),
    getBeetsSonicPrices(tokenPrices),
    getBeetsOPPrices(tokenPrices),
    getKodiakPrices(tokenPrices),
    getCurveEthereumPrices(tokenPrices),
    getCurvePolygonPrices(tokenPrices),
    getCurveArbitrumPrices(tokenPrices),
    getCurveLendPricesCommon(ETH_CHAIN_ID, ethereumCurveLendPools, tokenPrices),
    getCurveLendPricesCommon(FRX_CHAIN_ID, fraxtalCurveLendPools, tokenPrices),
    getCurveOptimismPrices(tokenPrices),
    getCurvePricesCommon(FRX_CHAIN_ID, fraxtalCurvePools, tokenPrices),
    getCurvePricesCommon(PLASMA_CHAIN_ID, plasmaCurvePools, tokenPrices),
    getCurvePricesCommon(MONAD_CHAIN_ID, monadCurvePools, tokenPrices),
    getCurveBasePrices(tokenPrices),
    getGammaLineaPrices(tokenPrices),
    getBeefyCowArbPrices(tokenPrices),
    getBeefyCowOPPrices(tokenPrices),
    getBeefyCowBasePrices(tokenPrices),
    getBeefyCowLineaPrices(tokenPrices),
    getBeefyCowPolyPrices(tokenPrices),
    getBeefyCowZkSyncPrices(tokenPrices),
    getBeefyCowMantlePrices(tokenPrices),
    getBeefyCowSeiPrices(tokenPrices),
    getBeefyCowBscPrices(tokenPrices),
    getBeefyCowAvaxPrices(tokenPrices),
    getBeefyCowRootstockPrices(tokenPrices),
    getBeefyCowScrollPrices(tokenPrices),
    getBeefyCowLiskPrices(tokenPrices),
    getBeefyCowSonicPrices(tokenPrices),
    getBeefyCowBerachainPrices(tokenPrices),
    getBeefyCowGnosisPrices(tokenPrices),
    getBeefyCowHyperevmPrices(tokenPrices),
    getBeefyCowPlasmaPrices(tokenPrices),
    getBeefyCowMonadPrices(tokenPrices),
    getBeefyCowMegaethPrices(tokenPrices),
    getBeefyCowRobinhoodPrices(tokenPrices),
    getBeefyCowEthereumPrices(tokenPrices),
    getPendleCommonPrices(ETH_CHAIN_ID, ethereumPendlePools, tokenPrices),
    getPendleCommonPrices(ETH_CHAIN_ID, ethereumPendleUnboostedPools, tokenPrices),
    getMellowVeloPrices(BASE_CHAIN_ID, baseMellowAeroPools, tokenPrices),
    getBunniPrices(BASE_CHAIN_ID, baseAlienBaseBunniPools, tokenPrices),
    getMorphoPrices(BASE_CHAIN_ID, baseMorphoPools, tokenPrices),
    getMorphoPrices(ETH_CHAIN_ID, ethereumMorphoPools, tokenPrices),
    getMorphoPrices(POLYGON_CHAIN_ID, maticMorphoPools, tokenPrices),
    getMorphoPrices(MONAD_CHAIN_ID, monadMorphoPools, tokenPrices),
    getMorphoPrices(ARB_CHAIN_ID, arbitrumMorphoPools, tokenPrices),
    getMorphoPrices(OPTIMISM_CHAIN_ID, optimismMorphoPools, tokenPrices),
    getIchiPrices(SONIC_CHAIN_ID, sonicSwapxIchiPools, tokenPrices),
    getEulerPrices(MONAD_CHAIN_ID, monadEulerPools, tokenPrices),
    getSolidlyStablePrices(AVAX_CHAIN_ID, avaxBlackStableLpPools, tokenPrices),
    getSolidlyStablePrices(PLASMA_CHAIN_ID, plasmaLithosStablePools, tokenPrices),
    getSiloPrices(AVAX_CHAIN_ID, avaxSiloPools, tokenPrices),
    getAerodromePositionPrices(tokenPrices),
  ];

  // Setup error logs
  promiseArrayTiming(promises, i => `getNonAmmPrices[${i}]`).forEach(
    (p, i) => p.catch(e => logger.warn({ index: i, err: e }, 'non-amm price source failed')) //e.shortMessage ?? e.message))
  );

  const results = await Promise.allSettled(promises);
  // results.forEach((r: any, i) => console.log(i, Object.keys(r.value)[0]));

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
}

export default getNonAmmPrices;
