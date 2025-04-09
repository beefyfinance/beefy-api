import { getEllipsisPrices } from './bsc/getEllipsisPrices';
import getCurvePolygonPrices from './matic/getCurvePrices';
import getCurveArbitrumPrices from './arbitrum/getCurvePrices';
import getCurveOptimismPrices from './optimism/getCurvePrices';
import { getCurveEthereumPrices } from './ethereum/getCurvePrices';
// import getBeethovenxPrices from './fantom/getBeethovenxPrices';
import getBeetsOPPrices from './optimism/getBeetsOPPrices';
import getBalancerArbPrices from './arbitrum/getBalancerArbPrices';
import getBalancerAvaxPrices from './avax/getBalancerPrices';
import getBalancerBasePrices from './base/getBalancerPrices';
import getBalancerPolyPrices from './matic/getBalancerPolyPrices';
import getBeetsSonicPrices from './sonic/getBeetsSonicPrices';
import getVelodromeStablePrices from './optimism/getVelodromeStablePrices';
import getEquilibreStablePrices from './kava/getEquilibreStablePrices';
import getHermesStablePrices from './metis/getHermesStablePrices';
import getCurveKavaPrices from './kava/getCurvePrices';
import { getGmxV2ArbitrumPrices } from './arbitrum/getGmxV2Prices';
import { getGmxArbitrumPrices } from './arbitrum/getGmxPrices';
import { getGmxAvalanchePrices } from './avax/getGmxPrices';
import getAuraBalancerPrices from './ethereum/getAuraBalancerPrices';
import getFerroPrices from './cronos/getFerroPrices';
import getHopArbPrices from './arbitrum/getHopArbPrices';
import getHopOpPrices from './optimism/getHopOpPrices';
import getStargateLineaPrices from './linea/getStargateLineaPrices';
import getStargateEthPrices from './ethereum/getStargateEthPrices';
import getStargateArbPrices from './arbitrum/getStargateArbPrices';
import getStargateAvaxPrices from './avax/getStargateAvaxPrices';
import getStargateBscPrices from './bsc/stargate/getStargateBscPrices';
import getStargatePolygonPrices from './matic/getStargatePolygonPrices';
import getStargateOpPrices from './optimism/getStargateOpPrices';
import getStargateMetisPrices from './metis/getStargateMetisPrices';
import getStargateBasePrices from './base/getStargateBasePrices';
import getStargateMantlePrices from './mantle/getStargateMantlePrices';
import getStargateSeiPrices from './sei/getStargateSeiPrices';
import getOlpPrices from './optimism/getOlpPrices';
import getThenaStablePrices from './bsc/getThenaStablePrices';
import getCantoStablePrices from './canto/getCantoStablePrices';
import getSolidLizardStablePrices from './arbitrum/getSolidLizardStablePrices';
import getRamsesStablePrices from './arbitrum/getRamsesStablePrices';
import getMmyOptimismPrices from './optimism/getMmyOptimismPrices';
import getVelocoreStablePrices from './zksync/getVelocoreStablePrices';
import getBscGammaPrices from './bsc/getBscGammaPrices';
import { getCurveBasePrices } from './base/getCurvePrices';
import getUniswapArbitrumPrices from './arbitrum/getUniswapPositionPrices';
import getUniswapEthereumPrices from './ethereum/getUniswapPositionPrices';
import getUniswapEthereumGammaPrices from './ethereum/getUniswapGammaPrices';
import getGammaPolygonPrices from './matic/getGammaPolygonPrices';
import getUniswapGammaPrices from './optimism/getUniswapGammaPrices';
import getBasoStablePrices from './base/getBasoStablePrices';
import { getAerodromeStablePrices } from './base/getAerodromeStablePrices';
import { getKinetixPrices } from './kava/getKinetixPrices';
import getEqualizerStableSonicPrices from './sonic/getEqualizerStablePrices';
import getBalancerGnosisPrices from './gnosis/getBalancerGnosisPrices';
import getCurvePricesCommon from './common/curve/getCurvePricesCommon';
import { getCurveLendPricesCommon } from './common/curve/getCurveLendPricesCommon';
import getArbitrumSiloPrices from './arbitrum/getArbitrumSiloPrices';
import getVelodromeModeStablePrices from './mode/getVelodromeModeStablePrices';
import getVelodromeLiskStablePrices from './lisk/getVelodromeLiskStablePrices';
import getNuriStablePrices from './scroll/getNuriStablePrices';
import getTokanStablePrices from './scroll/getTokanStablePrices';
import getBeraswapPrices from './berachain/getBeraswapPrices';
import { getKodiakPrices } from './berachain/getKodiakPrices';
import {
  ARBITRUM_CHAIN_ID as ARB_CHAIN_ID,
  BASE_CHAIN_ID,
  BSC_CHAIN_ID,
  ETH_CHAIN_ID,
  FRAXTAL_CHAIN_ID as FRX_CHAIN_ID,
  GNOSIS_CHAIN_ID as GNO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
  POLYGON_CHAIN_ID,
  SONIC_CHAIN_ID,
} from '../../constants';
import getSolidlyStablePrices from './common/getSolidlyStablePrices';
import getEthSiloPrices from './ethereum/getEthereumSiloPrices';
import getGammaLineaPrices from './linea/getGammaPrices';
import getLynexStablePrices from './linea/getLynexStablePrices';
import getNileStablePrices from './linea/getNileStablePrices';
import { getMimSwapPrices } from './arbitrum/getMimSwapPrices';
import { getBeefyCowArbPrices } from './arbitrum/getBeefyCowArbPrices';
import { getBeefyCowOPPrices } from './optimism/getBeefyCowOPPrices';
// import getFtmIchiPrices from './fantom/getFtmIchiPrices';
import { getBeefyCowBasePrices } from './base/getBeefyCowBasePrices';
import { getBeefyCowMoonbeamPrices } from './moonbeam/getBeefyCowMoonbeamPricis';
import { getBeefyCowLineaPrices } from './linea/getBeefyLineaCowPrices';
import getOptimismSiloPrices from './optimism/getOptimismSiloPrices';
import { getBeefyCowPolyPrices } from './matic/getBeefyPolyCowPrices';
import { getBeefyCowZkSyncPrices } from './zksync/getBeefyCowZkSyncPrices';
import { getBeefyCowMantaPrices } from './manta/getBeefyMantaCowPrices';
import { getBeefyCowMantlePrices } from './mantle/getBeefyMantleCowPrices';
import { getBeefyCowSeiPrices } from './sei/getBeefySeiCowPrices';
import { getBeefyCowBscPrices } from './bsc/getBeefyCowBscPrices';
import { getBeefyCowAvaxPrices } from './avax/getBeefyCowAvaxPrices';
import { getBeefyCowRootstockPrices } from './rootstock/getBeefyRootstockCowPrices';
import { getBeefyCowScrollPrices } from './scroll/getBeefyScrollCowPrices';
import { getBeefyCowModePrices } from './mode/getBeefyModeCowPrices';
import { getBeefyCowLiskPrices } from './lisk/getBeefyLiskCowPrices';
import { getBeefyCowBerachainPrices } from './berachain/getBeefyBerachainCowPrices';
import { getBeefyCowGnosisPrices } from './gnosis/getBeefyGnosisCowPrices';
import { getPendleCommonPrices } from './common/getPendleCommonPrices';
import { getMellowVeloPrices } from './common/getMellowVeloPrices';
import { getBunniPrices } from './common/getBunniPrices';
import getBaseSiloPrices from './base/getBaseSiloPrices';
import getSonicSiloPrices from './sonic/getSonicSiloPrices';
import getVenusArbPrices from './arbitrum/getVenusArbPrices';
import getVenusZkPrices from './zksync/getVenusZkPrices';
import getTokemakEthPrices from './ethereum/getTokemakEthPrices';
import getTokemakBasePrices from './base/getTokemakBasePrices';
import { getBeefyCowSonicPrices } from './sonic/getBeefySonicCowPrices';
import { getMorphoPrices } from './common/morpho/getMorphoPrices';
import { getIchiPrices } from './common/getIchiPrices';
import { promiseArrayTiming } from '../../utils/timing';

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
    getArbitrumSiloPrices(tokenPrices),
    getEthSiloPrices(tokenPrices),
    getOptimismSiloPrices(tokenPrices),
    getSonicSiloPrices(tokenPrices),
    getEqualizerStableSonicPrices(tokenPrices),
    getKinetixPrices(tokenPrices),
    getBasoStablePrices(tokenPrices),
    getUniswapGammaPrices(tokenPrices),
    getUniswapArbitrumPrices(tokenPrices),
    getUniswapEthereumPrices(tokenPrices),
    getVelocoreStablePrices(tokenPrices),
    getMmyOptimismPrices(tokenPrices),
    getRamsesStablePrices(tokenPrices),
    getEquilibreStablePrices(tokenPrices),
    getSolidLizardStablePrices(tokenPrices),
    getCantoStablePrices(tokenPrices),
    getMimSwapPrices(tokenPrices),
    getThenaStablePrices(tokenPrices),
    getOlpPrices(),
    getStargateBasePrices(tokenPrices),
    getStargateMetisPrices(tokenPrices),
    getStargateOpPrices(tokenPrices),
    getStargatePolygonPrices(tokenPrices),
    getStargateBscPrices(tokenPrices),
    getStargateAvaxPrices(tokenPrices),
    getStargateArbPrices(tokenPrices),
    getStargateEthPrices(tokenPrices),
    getStargateLineaPrices(tokenPrices),
    getStargateMantlePrices(tokenPrices),
    getStargateSeiPrices(tokenPrices),
    getHopOpPrices(tokenPrices),
    getHopArbPrices(tokenPrices),
    getFerroPrices(tokenPrices),
    getAuraBalancerPrices(tokenPrices),
    getGmxV2ArbitrumPrices(),
    getGmxAvalanchePrices(tokenPrices),
    getGmxArbitrumPrices(tokenPrices),
    getHermesStablePrices(tokenPrices),
    getVelodromeStablePrices(tokenPrices),
    getVelodromeModeStablePrices(tokenPrices),
    getVelodromeLiskStablePrices(tokenPrices),
    getSolidlyStablePrices(FRX_CHAIN_ID, require('../../data/fraxtal/veloStablePools.json'), tokenPrices),
    getAerodromeStablePrices(tokenPrices),
    getBalancerAvaxPrices(tokenPrices),
    getBalancerBasePrices(tokenPrices),
    getBalancerPolyPrices(tokenPrices),
    getBalancerArbPrices(tokenPrices),
    getBalancerGnosisPrices(tokenPrices),
    // getBeethovenxPrices(tokenPrices),
    getBeetsSonicPrices(tokenPrices),
    getBeetsOPPrices(tokenPrices),
    getBeraswapPrices(tokenPrices),
    getKodiakPrices(tokenPrices),
    getEllipsisPrices(tokenPrices),
    getCurveEthereumPrices(tokenPrices),
    getCurvePolygonPrices(tokenPrices),
    getCurveArbitrumPrices(tokenPrices),
    getCurveLendPricesCommon(ARB_CHAIN_ID, require('../../data/arbitrum/curveLendPools.json'), tokenPrices),
    getCurveLendPricesCommon(ETH_CHAIN_ID, require('../../data/ethereum/curveLendPools.json'), tokenPrices),
    getCurveLendPricesCommon(FRX_CHAIN_ID, require('../../data/fraxtal/curveLendPools.json'), tokenPrices),
    getCurveOptimismPrices(tokenPrices),
    getCurveKavaPrices(tokenPrices),
    getCurvePricesCommon(GNO_CHAIN_ID, require('../../data/gnosis/curvePools.json'), tokenPrices),
    getCurvePricesCommon(FRX_CHAIN_ID, require('../../data/fraxtal/curvePools.json'), tokenPrices),
    getCurvePricesCommon(SONIC_CHAIN_ID, require('../../data/sonic/curvePools.json'), tokenPrices),
    getCurveBasePrices(tokenPrices),
    getBscGammaPrices(tokenPrices),
    getGammaPolygonPrices(tokenPrices),
    getUniswapEthereumGammaPrices(tokenPrices),
    getGammaLineaPrices(tokenPrices),
    getLynexStablePrices(tokenPrices),
    getNileStablePrices(tokenPrices),
    getBeefyCowArbPrices(tokenPrices),
    getBeefyCowOPPrices(tokenPrices),
    getBeefyCowBasePrices(tokenPrices),
    getBeefyCowMoonbeamPrices(tokenPrices),
    getBeefyCowLineaPrices(tokenPrices),
    getBeefyCowPolyPrices(tokenPrices),
    getBeefyCowZkSyncPrices(tokenPrices),
    getBeefyCowMantaPrices(tokenPrices),
    getBeefyCowMantlePrices(tokenPrices),
    getBeefyCowSeiPrices(tokenPrices),
    getBeefyCowBscPrices(tokenPrices),
    getBeefyCowAvaxPrices(tokenPrices),
    getBeefyCowRootstockPrices(tokenPrices),
    getBeefyCowScrollPrices(tokenPrices),
    getBeefyCowModePrices(tokenPrices),
    getBeefyCowLiskPrices(tokenPrices),
    getBeefyCowSonicPrices(tokenPrices),
    getBeefyCowBerachainPrices(tokenPrices),
    getBeefyCowGnosisPrices(tokenPrices),
    // getFtmIchiPrices(tokenPrices),
    getPendleCommonPrices(ARB_CHAIN_ID, require('../../data/arbitrum/equilibriaPools.json'), tokenPrices),
    getPendleCommonPrices(ARB_CHAIN_ID, require('../../data/arbitrum/pendlePools.json'), tokenPrices, {}),
    getPendleCommonPrices(ETH_CHAIN_ID, require('../../data/ethereum/pendlePools.json'), tokenPrices, {}),
    getPendleCommonPrices(BSC_CHAIN_ID, require('../../data/bsc/pendlePools.json'), tokenPrices, ammPrices),
    getPendleCommonPrices(BASE_CHAIN_ID, require('../../data/base/pendlePools.json'), tokenPrices, ammPrices),
    getPendleCommonPrices(SONIC_CHAIN_ID, require('../../data/sonic/pendlePools.json'), tokenPrices),
    getMellowVeloPrices(OPTIMISM_CHAIN_ID, require('../../data/optimism/mellowVeloPools.json'), tokenPrices),
    getMellowVeloPrices(BASE_CHAIN_ID, require('../../data/base/mellowAeroPools.json'), tokenPrices),
    getBunniPrices(BASE_CHAIN_ID, require('../../data/base/alienBaseBunniPools.json'), tokenPrices),
    getMorphoPrices(BASE_CHAIN_ID, require('../../data/base/morphoPools.json'), tokenPrices),
    getMorphoPrices(ETH_CHAIN_ID, require('../../data/ethereum/morphoPools.json'), tokenPrices),
    getMorphoPrices(POLYGON_CHAIN_ID, require('../../data/matic/morphoPools.json'), tokenPrices),
    getIchiPrices(SONIC_CHAIN_ID, require('../../data/sonic/swapxIchiPools.json'), tokenPrices),
    getSolidlyStablePrices(SONIC_CHAIN_ID, require('../../data/sonic/swapxStableLpPools.json'), tokenPrices),
    getBaseSiloPrices(tokenPrices),
    getNuriStablePrices(tokenPrices),
    getTokanStablePrices(tokenPrices),
    getVenusArbPrices(tokenPrices),
    getVenusZkPrices(tokenPrices),
    getTokemakEthPrices(tokenPrices),
    getTokemakBasePrices(tokenPrices),
  ];

  // Setup error logs
  promiseArrayTiming(promises, i => `getNonAmmPrices[${i}]`).forEach((p, i) =>
    p.catch(e => console.warn('getNonAmmPrices error', i, e.shortMessage ?? e.message))
  );

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
}

export default getNonAmmPrices;
