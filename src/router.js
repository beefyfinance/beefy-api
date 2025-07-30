'use strict';

const Router = require('koa-router');
const router = new Router();

const noop = require('./api/noop');
const stats = require('./api/stats');
const supply = require('./api/supply');
const price = require('./api/price');
const cmc = require('./api/cmc');
const tvl = require('./api/tvl');
const multichainVaults = require('./api/vaults');
const snapshot = require('./api/snapshot');
const { boosts, chainBoosts, boostsV2, chainBoostsV2 } = require('./api/boosts');
const {
  getTokens,
  getChainTokens,
  getChainNatives,
  getChainToken,
  getNativesFromAllChains,
} = require('./api/tokens');
const { getConfigs, getChainConfig } = require('./api/config');
const { getTreasury, getMMBal, getAllTreasury } = require('./api/treasury');
const { validatorPerformance } = require('./api/validators/index');
const { proxyOneInchSwap, proxyOneInchQuote } = require('./api/zap/proxy/one-inch');
const { proxyKyberSwap, proxyKyberQuote } = require('./api/zap/proxy/kyber');
const { zapSwapsSupport, zapSwapsSupportDebug } = require('./api/zap/swap/routes');
const { getArticles, getLatestArticle } = require('./api/articles');
const {
  handleCowcentratedPriceRanges,
  handleCowcentratedLTIPPCampaignsForDune,
} = require('./api/cowcentrated');
const {
  handleOffChainRewardsAll,
  handleOffChainRewardsAllForChain,
  handleOffChainRewardsActive,
  handleOffChainRewardsActiveForChain,
} = require('./api/offchain-rewards');
const { pointStructures } = require('./api/points');
const { proxyOdosQuote, proxyOdosSwap } = require('./api/zap/proxy/odos');
const { proxyLiquidSwapSwap, proxyLiquidSwapQuote } = require('./api/zap/proxy/liquid-swap');
const { submitDivvi } = require('./api/referral/divvi/routes');

router.get('/validator-performance', validatorPerformance);

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
router.get('/treasury/mm', getMMBal);
router.get('/treasury/complete', getAllTreasury);

router.get('/snapshot/latest', snapshot.latest);
router.get('/snapshot/active', snapshot.active);

router.get('/zap/swaps', zapSwapsSupport);
router.get('/zap/swaps/debug', zapSwapsSupportDebug);
router.get('/zap/providers/oneinch/:chainId/quote', proxyOneInchQuote);
router.get('/zap/providers/oneinch/:chainId/swap', proxyOneInchSwap);
router.get('/zap/providers/kyber/:chainId/quote', proxyKyberQuote);
router.post('/zap/providers/kyber/:chainId/swap', proxyKyberSwap);
router.post('/zap/providers/odos/:chainId/quote', proxyOdosQuote);
router.post('/zap/providers/odos/:chainId/swap', proxyOdosSwap);
router.get('/zap/providers/liquid-swap/:chainId/quote', proxyLiquidSwapQuote);
router.post('/zap/providers/liquid-swap/:chainId/swap', proxyLiquidSwapSwap);

router.get('/articles', getArticles);
router.get('/articles/latest', getLatestArticle);

router.get('/points-structures', pointStructures);

router.post('/ref/divvi', submitDivvi);

router.get('/', noop);

module.exports = router;
