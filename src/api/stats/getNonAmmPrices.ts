import getBeltPrices from './bsc/belt/getBeltPrices';
import getEllipsisPricesOld from './bsc/ellipsis/getEllipsisPricesOld';
import { getEllipsisPrices } from './bsc/getEllipsisPrices';
import getCurvePolygonPrices from './matic/getCurvePrices';
import getCurveFantomPrices from './fantom/getCurvePrices';
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
import getBalancerAvaxPrices from './avax/getBalancerPrices';
import getBalancerBasePrices from './base/getBalancerPrices';
import getBalancerPolyPrices from './matic/getBalancerPolyPrices';
import getBalancerZkevmPrices from './zkevm/getBalancerPrices';
import getVelodromeStablePrices from './optimism/getVelodromeStablePrices';
import getEquilibreStablePrices from './kava/getEquilibreStablePrices';
import getSolidlyV1StablePrices from './fantom/getSolidlyV1StablePrices';
import getVoltagePrices from './fuse/getVoltagePrices';
import getBeamswapPrices from './moonbeam/getBeamswapPrices';
import getTrisolarisPrices from './aurora/getTrisolarisPrices';
import getConeStablePrices from './bsc/getConeStablePrices';
import getSpiritStablePrices from './fantom/getSpiritStablePrices';
import getHermesStablePrices from './metis/getHermesStablePrices';
import getCakeStablePrices from './bsc/pancake/getCakeStablePrices';
import getCurveKavaPrices from './kava/getCurvePrices';
import getSushiKavaPrices from './kava/getSushiPrices';
import getSushiArbPrices from './arbitrum/getSushiPrice';
import { getGmxArbitrumPrices } from './arbitrum/getGmxPrices';
import getGmxAvalanchePrices from './avax/getGmxPrices';
import getAuraBalancerPrices from './ethereum/getAuraBalancerPrices';
import getFerroPrices from './cronos/getFerroPrices';
import getHopArbPrices from './arbitrum/getHopArbPrices';
import getHopOpPrices from './optimism/getHopOpPrices';
import getHopPolyPrices from './matic/getHopPolyPrices';
import getStargateEthPrices from './ethereum/getStargateEthPrices';
import getStargateArbPrices from './arbitrum/getStargateArbPrices';
import getStargateAvaxPrices from './avax/getStargateAvaxPrices';
import getStargateBscPrices from './bsc/stargate/getStargateBscPrices';
import getStargateFantomPrices from './fantom/getStargateFantomPrices';
import getStargatePolygonPrices from './matic/getStargatePolygonPrices';
import getStargateOpPrices from './optimism/getStargateOpPrices';
import getStargateMetisPrices from './metis/getStargateMetisPrices';
import getStargateBasePrices from './base/getStargateBasePrices';
import getOlpPrices from './optimism/getOlpPrices';
import getEqualizerStablePrices from './fantom/getEqualizerStablePrices';
import getThenaStablePrices from './bsc/getThenaStablePrices';
import getSolidlyEthStablePrices from './ethereum/getSolidlyStablePrices';
import getMvxPrices from './matic/getMvxPrices';
import getCantoStablePrices from './canto/getCantoStablePrices';
import { getKyberPolygonPrices } from './matic/getKyberPolygonPrices';
import { getKyberArbitrumPrices } from './arbitrum/getKyberArbitrumPrices';
import { getKyberAvaxPrices } from './avax/getKyberAvaxPrices';
import { getKyberOptimismPrices } from './optimism/getKyberOptimismPrices';
import getSolidLizardStablePrices from './arbitrum/getSolidLizardStablePrices';
import getVelocimeterStablePrices from './canto/getVelocimeterStablePrices';
import getRamsesStablePrices from './arbitrum/getRamsesStablePrices';
import getMmyFantomPrices from './fantom/getMmyFantomPrices';
import getMmyOptimismPrices from './optimism/getMmyOptimismPrices';
import getVelocoreStablePrices from './zksync/getVelocoreStablePrices';
import getSoliSnekStablePrices from './avax/getSoliSnekStablePrices';
import getThenaGammaPrices from './bsc/getThenaGammaPrices';
import getCurveCeloPrices from './celo/getCurvePrices';
import { getCurveBasePrices } from './base/getCurvePrices';
import { getConicPrices } from './ethereum/getConicPrices';
import { getPolygonSolidlyStablePrices } from './matic/getPolygonSolidlyStablePrices';
import getUniswapArbitrumPrices from './arbitrum/getUniswapPositionPrices';
import getQuickGammaPrices from './matic/getQuickGammaPrices';
import getChronosStablePrices from './arbitrum/getChronosStablePrices';
import getQuickGammaZkPrices from './zkevm/getQuickGammaPrices';
import getFvmStablePrices from './fantom/getFvmStablePrices';
import getBvmStablePrices from './base/getBvmStablePrices';
import getRetroGammaPrices from './matic/getRetroGammaPrices';
import { getQlpZkPrices } from './zkevm/getQlpZkPrices';
import getUniswapGammaPrices from './optimism/getUniswapGammaPrices';
import getJoeAutoArbPrices from './arbitrum/getJoeAutoArbPrices';
import getJoeAutoAvaxPrices from './avax/getJoeAutoAvaxPrices';
import getBasoStablePrices from './base/getBasoStablePrices';
import { getAerodromeStablePrices } from './base/getAerodromeStablePrices';
import getUniswapGammaArbPrices from './arbitrum/getUniswapGammaPrices';
import { getKinetixPrices } from './kava/getKinetixPrices';
import getEqualizerStableBasePrices from './base/getEqualizerStablePrices';

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
    getEqualizerStableBasePrices(tokenPrices),
    getKinetixPrices(tokenPrices),
    getBasoStablePrices(tokenPrices),
    getUniswapGammaPrices(tokenPrices),
    getJoeAutoAvaxPrices(tokenPrices),
    getJoeAutoArbPrices(tokenPrices),
    getRetroGammaPrices(tokenPrices),
    getUniswapArbitrumPrices(tokenPrices),
    getSoliSnekStablePrices(tokenPrices),
    getVelocoreStablePrices(tokenPrices),
    getMmyOptimismPrices(tokenPrices),
    getMmyFantomPrices(tokenPrices),
    getRamsesStablePrices(tokenPrices),
    getEquilibreStablePrices(tokenPrices),
    getVelocimeterStablePrices(tokenPrices),
    getSolidLizardStablePrices(tokenPrices),
    getCantoStablePrices(tokenPrices),
    getKyberArbitrumPrices(tokenPrices),
    getKyberAvaxPrices(tokenPrices),
    getKyberOptimismPrices(tokenPrices),
    getKyberPolygonPrices(tokenPrices),
    getSolidlyEthStablePrices(tokenPrices),
    getThenaStablePrices(tokenPrices),
    getMvxPrices(tokenPrices),
    getEqualizerStablePrices(tokenPrices),
    getOlpPrices(),
    getStargateBasePrices(tokenPrices),
    getStargateMetisPrices(tokenPrices),
    getStargateOpPrices(tokenPrices),
    getStargatePolygonPrices(tokenPrices),
    getStargateFantomPrices(tokenPrices),
    getStargateBscPrices(tokenPrices),
    getStargateAvaxPrices(tokenPrices),
    getStargateArbPrices(tokenPrices),
    getStargateEthPrices(tokenPrices),
    getHopPolyPrices(tokenPrices), // <----
    getHopOpPrices(tokenPrices),
    getHopArbPrices(tokenPrices),
    getFerroPrices(tokenPrices),
    getAuraBalancerPrices(tokenPrices),
    getGmxAvalanchePrices(tokenPrices),
    getGmxArbitrumPrices(tokenPrices),
    getSushiKavaPrices(tokenPrices),
    getSushiArbPrices(tokenPrices),
    getHermesStablePrices(tokenPrices),
    getCakeStablePrices(tokenPrices),
    getSpiritStablePrices(tokenPrices),
    getConeStablePrices(tokenPrices),
    getTrisolarisPrices(tokenPrices),
    getBeamswapPrices(tokenPrices),
    getVoltagePrices(tokenPrices),
    getSolidlyV1StablePrices(tokenPrices),
    getPolygonSolidlyStablePrices(tokenPrices),
    getVelodromeStablePrices(tokenPrices),
    getAerodromeStablePrices(tokenPrices),
    getBalancerAvaxPrices(tokenPrices),
    getBalancerBasePrices(tokenPrices),
    getBalancerZkevmPrices(tokenPrices),
    getBalancerPolyPrices(tokenPrices),
    getBalancerArbPrices(tokenPrices),
    getBeethovenxPrices(tokenPrices),
    getBeetsOPPrices(tokenPrices),
    getBeltPrices(tokenPrices),
    getEllipsisPricesOld(),
    getEllipsisPrices(tokenPrices),
    getCurveEthereumPrices(tokenPrices),
    getCurvePolygonPrices(tokenPrices),
    getCurveFantomPrices(tokenPrices),
    getCurveArbitrumPrices(tokenPrices),
    getCurveAvaxPrices(tokenPrices),
    getCurveHarmonyPrices(tokenPrices),
    getCurveOptimismPrices(tokenPrices),
    getCurveMoonbeamPrices(tokenPrices),
    getCurveKavaPrices(tokenPrices),
    getCurveCeloPrices(tokenPrices),
    getCurveBasePrices(tokenPrices),
    getConicPrices(),
    getRosePrices(tokenPrices),
    getSynapsePrices(),
    getJarvisPrices(tokenPrices),
    getSolarbeamPrices(tokenPrices),
    getStellaswapPrices(tokenPrices),
    getThenaGammaPrices(tokenPrices),
    getQuickGammaPrices(tokenPrices),
    getQuickGammaZkPrices(tokenPrices),
    getChronosStablePrices(tokenPrices),
    getFvmStablePrices(tokenPrices),
    getBvmStablePrices(tokenPrices),
    getQlpZkPrices(tokenPrices),
    getUniswapGammaArbPrices(tokenPrices),
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
