'use strict';

const Router = require('koa-router');
const router = new Router();

const noop = require('./api/noop');
const stats = require('./api/stats');
const supply = require('./api/supply');
const price = require('./api/price');
const gov = require('./api/stats/gov');
const cmc = require('./api/cmc');
const tvl = require('./api/tvl');
const multichainVaults = require('./api/vaults');
const snapshot = require('./api/snapshot');
const { boosts, chainBoosts } = require('./api/boosts');
const { getTokens, getChainTokens } = require('./api/tokens');
const { getConfigs, getChainConfig } = require('./api/config');
const { getTreasury, getMMBal, getAllTreasury } = require('./api/treasury');
const { validatorPerformance } = require('./api/validators/index');
const { proxyOneInchSwap, proxyOneInchQuote } = require('./api/zap/proxy/one-inch');
const { proxyKyberSwap, proxyKyberQuote } = require('./api/zap/proxy/kyber');
const { zapSwapsSupport, zapSwapsSupportDebug } = require('./api/zap/swap/routes');
const { getArticles, getLatestArticle } = require('./api/articles');

router.get('/validator-performance', validatorPerformance);

router.get('/apy', stats.apy);
router.get('/apy/breakdown', stats.apyBreakdowns);
router.get('/apy/boosts', stats.boostApr);

router.get('/tvl', tvl.vaultTvl);
router.get('/cmc', cmc.vaults);

router.get('/supply', supply.supply);
router.get('/supply/total', supply.total);
router.get('/supply/circulating', supply.circulating);

router.get('/earnings', gov.earnings);
router.get('/holders', gov.holderCount);

router.get('/lps', price.lpsPrices);
router.get('/lps/breakdown', price.lpsBreakdown);
router.get('/prices', price.tokenPrices);
router.get('/mootokenprices', price.mooTokenPrices);

router.get('/vaults', multichainVaults.multichainVaults);
router.get('/vaults/last-harvest', multichainVaults.vaultsLastHarvest);
router.get('/vaults/id/:vaultId', multichainVaults.singleVault);
router.get('/vaults/:chainId', multichainVaults.singleChainVaults);
router.get('/gov-vaults', multichainVaults.multichainGovVaults);
router.get('/gov-vaults/:chainId', multichainVaults.singleGovChainVaults);

router.get('/fees', multichainVaults.vaultFees);

router.get('/boosts', boosts);
router.get('/boosts/:chainId', chainBoosts);

router.get('/tokens', getTokens);
router.get('/tokens/:chainId', getChainTokens);

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

router.get('/articles', getArticles);
router.get('/articles/latest', getLatestArticle);

router.get('/', noop);

module.exports = router;
