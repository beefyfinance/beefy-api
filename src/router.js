import Router from 'koa-router';
import noop from './api/noop.js';
import * as stats from './api/stats/index.ts';
import * as supply from './api/supply/index.js';
import * as price from './api/price/index.js';
import * as cmc from './api/cmc/index.js';
import * as tvl from './api/tvl/index.js';
import * as multichainVaults from './api/vaults/index.ts';
import * as snapshot from './api/snapshot/index.ts';
import { boosts, chainBoosts, boostsV2, chainBoostsV2 } from './api/boosts/index.ts';
import {
  getTokens,
  getChainTokens,
  getChainNatives,
  getChainToken,
  getNativesFromAllChains,
} from './api/tokens/index.ts';
import { getConfigs, getChainConfig } from './api/config/index.ts';
import { getTreasury } from './api/treasury/index.ts';
import { proxyOneInchSwap, proxyOneInchQuote } from './api/zap/proxy/one-inch.ts';
import { proxyKyberSwap, proxyKyberQuote } from './api/zap/proxy/kyber.ts';
import { zapSwapsSupport, zapSwapsSupportDebug } from './api/zap/swap/routes.ts';
import { getArticles, getLatestArticle } from './api/articles/index.ts';
import { handleCowcentratedPriceRanges, handleCowcentratedLTIPPCampaignsForDune } from './api/cowcentrated/index.ts';
import {
  handleOffChainRewardsAll,
  handleOffChainRewardsAllForChain,
  handleOffChainRewardsActive,
  handleOffChainRewardsActiveForChain,
} from './api/offchain-rewards/index.ts';
import { pointStructures } from './api/points/index.ts';
import { proxyLiquidSwapSwap, proxyLiquidSwapQuote } from './api/zap/proxy/liquid-swap.ts';

const router = new Router();

router.get('/apy', stats.apy);
router.get('/apy/breakdown', stats.apyBreakdowns);
router.get('/apy/boosts', stats.boostApr);

router.get('/tvl', tvl.vaultTvl);
router.get('/cmc', cmc.vaults);

router.get('/supply', supply.supply);
router.get('/supply/total', supply.total);
router.get('/supply/circulating', supply.circulating);

// router.get('/earnings', gov.earnings);
// router.get('/holders', gov.holderCount);

router.get('/lps', price.lpsPrices);
router.get('/lps/breakdown', price.lpsBreakdown);
router.get('/prices', price.tokenPrices);
router.get('/mootokenprices', price.mooTokenPrices);

router.get('/vault/:vaultId', multichainVaults.singleAnyVault);
router.get('/vaults/all/:chainId', multichainVaults.singleChainAllVaults);
router.get('/vaults/all', multichainVaults.multichainAllVaults);

router.get('/vaults/last-harvest', multichainVaults.vaultsLastHarvest);

router.get('/vaults/id/:vaultId', multichainVaults.singleVault);
router.get('/vaults/:chainId', multichainVaults.singleChainStandardVaults);
router.get('/vaults', multichainVaults.multichainStandardVaults);

router.get('/gov-vaults/id/:vaultId', multichainVaults.singleGovVault);
router.get('/gov-vaults/:chainId', multichainVaults.singleChainGovVaults);
router.get('/gov-vaults', multichainVaults.multichainGovVaults);

router.get('/cow-vaults/id/:vaultId', multichainVaults.singleCowVault);
router.get('/cow-vaults/:chainId', multichainVaults.singleChainCowVaults);
router.get('/cow-vaults', multichainVaults.multichainCowVaults);

router.get('/harvestable-vaults/id/:vaultId', multichainVaults.singleHarvestableVault);
router.get('/harvestable-vaults/:chainId/related', multichainVaults.singleChainHarvestableVaultsWithRelated);
router.get('/harvestable-vaults/related', multichainVaults.multichainHarvestableVaultsWithRelated);
router.get('/harvestable-vaults/:chainId', multichainVaults.singleChainHarvestableVaults);
router.get('/harvestable-vaults', multichainVaults.multichainHarvestableVaults);

router.get('/clm-vaults/:chainId', multichainVaults.singleChainClms);
router.get('/clm-vaults', multichainVaults.multiChainClms);

router.get('/cow-price-ranges', handleCowcentratedPriceRanges);
router.get('/cow-dune-ltipp-merkl-campaigns', handleCowcentratedLTIPPCampaignsForDune);

router.get('/offchain-rewards/active/:chainId', handleOffChainRewardsActiveForChain);
router.get('/offchain-rewards/active', handleOffChainRewardsActive);
router.get('/offchain-rewards/:chainId', handleOffChainRewardsAllForChain);
router.get('/offchain-rewards/', handleOffChainRewardsAll);

router.get('/fees', multichainVaults.vaultFees);

router.get('/boosts/v2/:chainId', chainBoostsV2);
router.get('/boosts/v2', boostsV2);
router.get('/boosts/:chainId', chainBoosts);
router.get('/boosts', boosts);

router.get('/tokens', getTokens);
router.get('/tokens/native', getNativesFromAllChains);
router.get('/tokens/:chainId', getChainTokens);
router.get('/tokens/:chainId/native', getChainNatives);
router.get('/tokens/:chainId/:tokenId', getChainToken);

router.get('/config', getConfigs);
router.get('/config/:chainId', getChainConfig);

router.get('/treasury', getTreasury);

router.get('/snapshot/latest', snapshot.latest);
router.get('/snapshot/active', snapshot.active);

router.get('/zap/swaps', zapSwapsSupport);
router.get('/zap/swaps/debug', zapSwapsSupportDebug);
router.get('/zap/providers/oneinch/:chainId/quote', proxyOneInchQuote);
router.get('/zap/providers/oneinch/:chainId/swap', proxyOneInchSwap);
router.get('/zap/providers/kyber/:chainId/quote', proxyKyberQuote);
router.post('/zap/providers/kyber/:chainId/swap', proxyKyberSwap);
router.get('/zap/providers/liquid-swap/:chainId/quote', proxyLiquidSwapQuote);
router.post('/zap/providers/liquid-swap/:chainId/swap', proxyLiquidSwapSwap);

router.get('/articles', getArticles);
router.get('/articles/latest', getLatestArticle);

router.get('/points-structures', pointStructures);

router.get('/', noop);

export default router;
