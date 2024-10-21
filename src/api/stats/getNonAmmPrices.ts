import { getEllipsisPrices } from './bsc/getEllipsisPrices';
import getCurvePolygonPrices from './matic/getCurvePrices';
import getCurveArbitrumPrices from './arbitrum/getCurvePrices';
import getCurveOptimismPrices from './optimism/getCurvePrices';
import getCurveMoonbeamPrices from './moonbeam/getCurvePrices';
import { getCurveEthereumPrices } from './ethereum/getCurvePrices';
import getBeethovenxPrices from './fantom/getBeethovenxPrices';
import getSolarbeamPrices from './moonriver/getSolarbeamPrices';
import getRosePrices from './aurora/getRosePrices';
import getStellaswapPrices from './moonbeam/getStellaswapPrices';
import getBeetsOPPrices from './optimism/getBeetsOPPrices';
import getBalancerArbPrices from './arbitrum/getBalancerArbPrices';
import getBalancerAvaxPrices from './avax/getBalancerPrices';
import getBalancerBasePrices from './base/getBalancerPrices';
import getBalancerPolyPrices from './matic/getBalancerPolyPrices';
import getBalancerZkevmPrices from './zkevm/getBalancerPrices';
import getVelodromeStablePrices from './optimism/getVelodromeStablePrices';
import getEquilibreStablePrices from './kava/getEquilibreStablePrices';
import getVoltagePrices from './fuse/getVoltagePrices';
import getBeamswapPrices from './moonbeam/getBeamswapPrices';
import getTrisolarisPrices from './aurora/getTrisolarisPrices';
import getHermesStablePrices from './metis/getHermesStablePrices';
import getCurveKavaPrices from './kava/getCurvePrices';
import getSushiKavaPrices from './kava/getSushiPrices';
import { getGmxV2ArbitrumPrices } from './arbitrum/getGmxV2Prices';
import { getGmxArbitrumPrices } from './arbitrum/getGmxPrices';
import getGmxAvalanchePrices from './avax/getGmxPrices';
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
import getStargateKavaPrices from './kava/getStargateKavaPrices';
import getStargateMantlePrices from './mantle/getStargateMantlePrices';
import getStargateSeiPrices from './sei/getStargateSeiPrices';
import getOlpPrices from './optimism/getOlpPrices';
import getThenaStablePrices from './bsc/getThenaStablePrices';
import getSolidlyEthStablePrices from './ethereum/getSolidlyStablePrices';
import getCantoStablePrices from './canto/getCantoStablePrices';
import { getKyberOptimismPrices } from './optimism/getKyberOptimismPrices';
import getSolidLizardStablePrices from './arbitrum/getSolidLizardStablePrices';
import getVelocimeterStablePrices from './canto/getVelocimeterStablePrices';
import getRamsesStablePrices from './arbitrum/getRamsesStablePrices';
import getMmyOptimismPrices from './optimism/getMmyOptimismPrices';
import getVelocoreStablePrices from './zksync/getVelocoreStablePrices';
import getBscGammaPrices from './bsc/getBscGammaPrices';
import getCurveCeloPrices from './celo/getCurvePrices';
import { getCurveBasePrices } from './base/getCurvePrices';
import { getConicPrices } from './ethereum/getConicPrices';
import getUniswapArbitrumPrices from './arbitrum/getUniswapPositionPrices';
import getUniswapEthereumPrices from './ethereum/getUniswapPositionPrices';
import getUniswapEthereumGammaPrices from './ethereum/getUniswapGammaPrices';
import getGammaBasePrices from './base/getGammaPrices';
import getGammaPolygonPrices from './matic/getGammaPolygonPrices';
import getQuickGammaZkPrices from './zkevm/getQuickGammaPrices';
import getBvmStablePrices from './base/getBvmStablePrices';
import { getQlpZkPrices } from './zkevm/getQlpZkPrices';
import getUniswapGammaPrices from './optimism/getUniswapGammaPrices';
import getBasoStablePrices from './base/getBasoStablePrices';
import { getAerodromeStablePrices } from './base/getAerodromeStablePrices';
import getGammaArbPrices from './arbitrum/getGammaPrices';
import { getKinetixPrices } from './kava/getKinetixPrices';
import getEqualizerStableBasePrices from './base/getEqualizerStablePrices';
import getBalancerGnosisPrices from './gnosis/getBalancerGnosisPrices';
import getCurvePricesCommon from './common/curve/getCurvePricesCommon';
import { getCurveLendPricesCommon } from './common/curve/getCurveLendPricesCommon';
import getArbitrumSiloPrices from './arbitrum/getArbitrumSiloPrices';
import getAcrossPrices from './ethereum/getAcrossPrices';
import getGammaMoonbeamPrices from './moonbeam/getGammaMoonbeamPrices';
import getVelodromeModeStablePrices from './mode/getVelodromeModeStablePrices';
import getNuriStablePrices from './scroll/getNuriStablePrices';
import {
  ARBITRUM_CHAIN_ID as ARB_CHAIN_ID,
  BASE_CHAIN_ID,
  ETH_CHAIN_ID,
  FRAXTAL_CHAIN_ID as FRX_CHAIN_ID,
  GNOSIS_CHAIN_ID as GNO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from '../../constants';
import getEthSiloPrices from './ethereum/getEthereumSiloPrices';
import getEthRangePrices from './ethereum/getEthRangePrices';
import getGammaLineaPrices from './linea/getGammaPrices';
import getLynexStablePrices from './linea/getLynexStablePrices';
import getNileStablePrices from './linea/getNileStablePrices';
import { getMimSwapPrices } from './arbitrum/getMimSwapPrices';
import { getPearlTridentPrices } from './real/getPearlTridentPrices';
import { getBeefyCowArbPrices } from './arbitrum/getBeefyCowArbPrices';
import { getBeefyCowOPPrices } from './optimism/getBeefyCowOPPrices';
import getFtmIchiPrices from './fantom/getFtmIchiPrices';
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
import { getPendleCommonPrices } from './common/getPendleCommonPrices';
import { getMellowVeloPrices } from './common/getMellowVeloPrices';
import getBaseSiloPrices from './base/getBaseSiloPrices';

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

export async function getNonAmmPrices(tokenPrices: Record<string, number>): Promise<NonAmmPrices> {
  let prices = {};
  let breakdown = {};

  const promises = [
    getAcrossPrices(tokenPrices),
    getArbitrumSiloPrices(tokenPrices),
    getEthSiloPrices(tokenPrices),
    getOptimismSiloPrices(tokenPrices),
    getEqualizerStableBasePrices(tokenPrices),
    getKinetixPrices(tokenPrices),
    getBasoStablePrices(tokenPrices),
    getUniswapGammaPrices(tokenPrices),
    getUniswapArbitrumPrices(tokenPrices),
    getUniswapEthereumPrices(tokenPrices),
    getVelocoreStablePrices(tokenPrices),
    getMmyOptimismPrices(tokenPrices),
    getRamsesStablePrices(tokenPrices),
    getEquilibreStablePrices(tokenPrices),
    getVelocimeterStablePrices(tokenPrices),
    getSolidLizardStablePrices(tokenPrices),
    getCantoStablePrices(tokenPrices),
    getKyberOptimismPrices(tokenPrices),
    getMimSwapPrices(tokenPrices),
    getSolidlyEthStablePrices(tokenPrices),
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
    getStargateKavaPrices(tokenPrices),
    getStargateLineaPrices(tokenPrices),
    getStargateMantlePrices(tokenPrices),
    getStargateSeiPrices(tokenPrices),
    // getHopPolyPrices(tokenPrices),
    getHopOpPrices(tokenPrices),
    getHopArbPrices(tokenPrices),
    getFerroPrices(tokenPrices),
    getAuraBalancerPrices(tokenPrices),
    getGmxV2ArbitrumPrices(),
    getGmxAvalanchePrices(tokenPrices),
    getGmxArbitrumPrices(tokenPrices),
    getSushiKavaPrices(tokenPrices),
    getHermesStablePrices(tokenPrices),
    getTrisolarisPrices(tokenPrices),
    getBeamswapPrices(tokenPrices),
    getVoltagePrices(tokenPrices),
    getVelodromeStablePrices(tokenPrices),
    getVelodromeModeStablePrices(tokenPrices),
    getAerodromeStablePrices(tokenPrices),
    getBalancerAvaxPrices(tokenPrices),
    getBalancerBasePrices(tokenPrices),
    getBalancerZkevmPrices(tokenPrices),
    getBalancerPolyPrices(tokenPrices),
    getBalancerArbPrices(tokenPrices),
    getBalancerGnosisPrices(tokenPrices),
    getBeethovenxPrices(tokenPrices),
    getBeetsOPPrices(tokenPrices),
    getEllipsisPrices(tokenPrices),
    getCurveEthereumPrices(tokenPrices),
    getCurvePolygonPrices(tokenPrices),
    getCurveArbitrumPrices(tokenPrices),
    getCurveLendPricesCommon(ARB_CHAIN_ID, require('../../data/arbitrum/curveLendPools.json'), tokenPrices),
    getCurveLendPricesCommon(ETH_CHAIN_ID, require('../../data/ethereum/curveLendPools.json'), tokenPrices),
    getCurveOptimismPrices(tokenPrices),
    getCurveMoonbeamPrices(tokenPrices),
    getCurveKavaPrices(tokenPrices),
    getCurveCeloPrices(tokenPrices),
    getCurvePricesCommon(GNO_CHAIN_ID, require('../../data/gnosis/curvePools.json'), tokenPrices),
    getCurvePricesCommon(FRX_CHAIN_ID, require('../../data/fraxtal/curvePools.json'), tokenPrices),
    getCurveBasePrices(tokenPrices),
    getConicPrices(),
    getRosePrices(tokenPrices),
    getSolarbeamPrices(tokenPrices),
    getStellaswapPrices(tokenPrices),
    getBscGammaPrices(tokenPrices),
    getGammaPolygonPrices(tokenPrices),
    getQuickGammaZkPrices(tokenPrices),
    getBvmStablePrices(tokenPrices),
    getQlpZkPrices(tokenPrices),
    getGammaArbPrices(tokenPrices),
    getUniswapEthereumGammaPrices(tokenPrices),
    getGammaBasePrices(tokenPrices),
    getGammaMoonbeamPrices(tokenPrices),
    getGammaLineaPrices(tokenPrices),
    getEthRangePrices(tokenPrices),
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
    getFtmIchiPrices(tokenPrices),
    getPendleCommonPrices(ARB_CHAIN_ID, require('../../data/arbitrum/equilibriaPools.json'), tokenPrices),
    getPendleCommonPrices(ETH_CHAIN_ID, require('../../data/ethereum/pendlePools.json'), tokenPrices),
    getPendleCommonPrices(ARB_CHAIN_ID, require('../../data/arbitrum/pendlePools.json'), tokenPrices),
    getMellowVeloPrices(OPTIMISM_CHAIN_ID, require('../../data/optimism/mellowVeloPools.json'), tokenPrices),
    getMellowVeloPrices(BASE_CHAIN_ID, require('../../data/base/mellowAeroPools.json'), tokenPrices),
    getPearlTridentPrices(tokenPrices),
    getBaseSiloPrices(tokenPrices),
    getNuriStablePrices(tokenPrices),
  ];

  // Setup error logs
  promises.forEach((p, i) =>
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
