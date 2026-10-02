import type { BreakdownsById, PricesById } from '../../types/prices.ts';
import { ApiChainId } from '../../utils/chain.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';
import { withTracing } from '../../utils/tracing.ts';
import { getCowClmChains } from '../cowcentrated/getCowClms.ts';
import getBalancerArbPrices from './arbitrum/getBalancerArbPrices.ts';
import getCurveArbitrumPrices from './arbitrum/getCurvePrices.ts';
import { getGmxArbitrumPrices } from './arbitrum/getGmxPrices.ts';
import { getMimSwapPrices } from './arbitrum/getMimSwapPrices.ts';
import getBalancerAvaxPrices from './avax/getBalancerPrices.ts';
import { getGmxAvalanchePrices } from './avax/getGmxPrices.ts';
import getAerodromePositionPrices from './base/getAerodromePositionPrices.ts';
import { getAerodromeStablePrices } from './base/getAerodromeStablePrices.ts';
import getBalancerBasePrices from './base/getBalancerPrices.ts';
import { getCurveBasePrices } from './base/getCurvePrices.ts';
import { getKodiakPrices } from './berachain/getKodiakPrices.ts';
import { getAaveV3Prices } from './common/aave/getAaveV3Prices.ts';
import { getAaveV4Prices } from './common/aave/getAaveV4Prices.ts';
import { getCurveLendPricesCommon } from './common/curve/getCurveLendPricesCommon.ts';
import getCurvePricesCommon from './common/curve/getCurvePricesCommon.ts';
import { getEulerPrices } from './common/euler/getEulerPrices.ts';
import { getGearboxPrices } from './common/gearbox/getGearboxPrices.ts';
import { getBeefyCowcentratedVaultPrices } from './common/getBeefyCowcentratedVaultPrices.ts';
import { getBunniPrices } from './common/getBunniPrices.ts';
import { getIchiPrices } from './common/getIchiPrices.ts';
import { getMellowVeloPrices } from './common/getMellowVeloPrices.ts';
import { getPendleCommonPrices } from './common/getPendleCommonPrices.ts';
import { getSiloPrices } from './common/getSiloPrices.ts';
import getSolidlyStablePrices from './common/getSolidlyStablePrices.ts';
import { getMorphoPrices } from './common/morpho/getMorphoPrices.ts';
import getAuraBalancerPrices from './ethereum/getAuraBalancerPrices.ts';
import { getCurveEthereumPrices } from './ethereum/getCurvePrices.ts';
import getUniswapEthereumPrices from './ethereum/getUniswapPositionPrices.ts';
import { getYieldBasisPrices } from './ethereum/getYieldBasisPrices.ts';
import getBalancerGnosisPrices from './gnosis/getBalancerGnosisPrices.ts';
import getGammaLineaPrices from './linea/getGammaPrices.ts';
import getVelodromeLiskStablePrices from './lisk/getVelodromeLiskStablePrices.ts';
import getCurvePolygonPrices from './matic/getCurvePrices.ts';
import getBalancerMonadPrices from './monad/getBalancerMonadPrices.ts';
import { getCurvanceMonadPrices } from './monad/getCurvanceMonadPrices.ts';
import { getNeverlandPrices } from './monad/getNeverlandPrices.ts';
import getBeetsOPPrices from './optimism/getBeetsOPPrices.ts';
import getCurveOptimismPrices from './optimism/getCurvePrices.ts';
import getVelodromeStablePrices from './optimism/getVelodromeStablePrices.ts';
import getBeetsSonicPrices from './sonic/getBeetsSonicPrices.ts';
import arbitrumMorphoPools from '../../data/arbitrum/morphoPools.json' with { type: 'json' };
import avaxAaveV4Pools from '../../data/avax/aaveV4Pools.json' with { type: 'json' };
import avaxBlackStableLpPools from '../../data/avax/blackStableLpPools.json' with { type: 'json' };
import avaxSiloPools from '../../data/avax/siloPools.json' with { type: 'json' };
import baseAaveV3Pools from '../../data/base/aaveV3Pools.json' with { type: 'json' };
import baseAlienBaseBunniPools from '../../data/base/alienBaseBunniPools.json' with { type: 'json' };
import baseMellowAeroPools from '../../data/base/mellowAeroPools.json' with { type: 'json' };
import baseMorphoPools from '../../data/base/morphoPools.json' with { type: 'json' };
import ethereumAaveV4Pools from '../../data/ethereum/aaveV4Pools.json' with { type: 'json' };
import ethereumMorphoPools from '../../data/ethereum/morphoPools.json' with { type: 'json' };
import ethereumPendlePools from '../../data/ethereum/pendlePools.json' with { type: 'json' };
import ethereumPendleUnboostedPools from '../../data/ethereum/pendleUnboostedPools.json' with { type: 'json' };
import fraxtalCurveLendPools from '../../data/fraxtal/curveLendPools.json' with { type: 'json' };
import fraxtalCurvePools from '../../data/fraxtal/curvePools.json' with { type: 'json' };
import mantleAaveV3Pools from '../../data/mantle/aaveV3Pools.json' with { type: 'json' };
import maticMorphoPools from '../../data/matic/morphoPools.json' with { type: 'json' };
import megaethAaveV3Pools from '../../data/megaeth/aaveV3Pools.json' with { type: 'json' };
import monadAaveV3Pools from '../../data/monad/aaveV3Pools.json' with { type: 'json' };
import monadCurvePools from '../../data/monad/curvePools.json' with { type: 'json' };
import monadEulerPools from '../../data/monad/eulerPools.json' with { type: 'json' };
import monadGearboxPools from '../../data/monad/gearboxPools.json' with { type: 'json' };
import monadMorphoPools from '../../data/monad/morphoPools.json' with { type: 'json' };
import optimismMorphoPools from '../../data/optimism/morphoPools.json' with { type: 'json' };
import plasmaCurvePools from '../../data/plasma/curvePools.json' with { type: 'json' };
import plasmaLithosStablePools from '../../data/plasma/lithosStablePools.json' with { type: 'json' };
import sonicSwapxIchiPools from '../../data/sonic/swapxIchiPools.json' with { type: 'json' };

const logger = getLoggerFor({ module: 'prices' });

export type NonAmmPrices = {
  prices: PricesById;
  breakdown: BreakdownsById;
};

export const getNonAmmPrices = withTracing(
  async (tokenPrices: Record<string, number>, ammPrices: Record<string, number>): Promise<NonAmmPrices> => {
    const prices: PricesById = {};
    const breakdown: BreakdownsById = {};

    const promises = [
      getAaveV4Prices(ApiChainId.ethereum, ethereumAaveV4Pools, tokenPrices),
      getAaveV4Prices(ApiChainId.avax, avaxAaveV4Pools, tokenPrices),
      getAaveV3Prices(ApiChainId.base, baseAaveV3Pools, tokenPrices),
      getAaveV3Prices(ApiChainId.mantle, mantleAaveV3Pools, tokenPrices),
      getAaveV3Prices(ApiChainId.megaeth, megaethAaveV3Pools, tokenPrices),
      getAaveV3Prices(ApiChainId.monad, monadAaveV3Pools, tokenPrices),
      getGearboxPrices(ApiChainId.monad, monadGearboxPools, tokenPrices),
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
      getCurveLendPricesCommon(ApiChainId.fraxtal, fraxtalCurveLendPools, tokenPrices),
      getCurveOptimismPrices(tokenPrices),
      getCurvePricesCommon(ApiChainId.fraxtal, fraxtalCurvePools, tokenPrices),
      getCurvePricesCommon(ApiChainId.plasma, plasmaCurvePools, tokenPrices),
      getCurvePricesCommon(ApiChainId.monad, monadCurvePools, tokenPrices),
      getCurveBasePrices(tokenPrices),
      getYieldBasisPrices(tokenPrices),
      getGammaLineaPrices(tokenPrices),
      ...getCowClmChains().map(chain => getBeefyCowcentratedVaultPrices(chain, tokenPrices)),
      getPendleCommonPrices(ApiChainId.ethereum, ethereumPendlePools, tokenPrices),
      getPendleCommonPrices(ApiChainId.ethereum, ethereumPendleUnboostedPools, tokenPrices),
      getMellowVeloPrices(ApiChainId.base, baseMellowAeroPools, tokenPrices),
      getBunniPrices(ApiChainId.base, baseAlienBaseBunniPools, tokenPrices),
      getMorphoPrices(ApiChainId.base, baseMorphoPools, tokenPrices),
      getMorphoPrices(ApiChainId.ethereum, ethereumMorphoPools, tokenPrices),
      getMorphoPrices(ApiChainId.polygon, maticMorphoPools, tokenPrices),
      getMorphoPrices(ApiChainId.monad, monadMorphoPools, tokenPrices),
      getMorphoPrices(ApiChainId.arbitrum, arbitrumMorphoPools, tokenPrices),
      getMorphoPrices(ApiChainId.optimism, optimismMorphoPools, tokenPrices),
      getIchiPrices(ApiChainId.sonic, sonicSwapxIchiPools, tokenPrices),
      getEulerPrices(ApiChainId.monad, monadEulerPools, tokenPrices),
      getSolidlyStablePrices(ApiChainId.avax, avaxBlackStableLpPools, tokenPrices),
      getSolidlyStablePrices(ApiChainId.plasma, plasmaLithosStablePools, tokenPrices),
      getSiloPrices(ApiChainId.avax, avaxSiloPools, tokenPrices),
      getAerodromePositionPrices(tokenPrices),
    ];

    // Setup error logs
    promises.forEach((p, i) => p.catch(e => logger.warn({ index: i, err: e }, 'non-amm price source failed')));

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
  },
  { logger }
);

export default getNonAmmPrices;
