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
const { boosts, chainBoosts } = require('./api/boosts');
const { bifibuyback } = require('./api/stats/bifibuyback/index');
const { getTokens, getChainTokens } = require('./api/tokens');

router.get('/apy', stats.apy);
router.get('/apy/breakdown', stats.apyBreakdowns);
router.get('/bifibuyback', bifibuyback);

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
router.get('/vaults/:chainId', multichainVaults.singleChainVaults);

router.get('/fees', multichainVaults.vaultFees);

router.get('/boosts', boosts);
router.get('/boosts/:chainId', chainBoosts);

router.get('/tokens', getTokens);
router.get('/tokens/:chainId', getChainTokens);

router.get('/', noop);

module.exports = router;
