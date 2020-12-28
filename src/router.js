'use strict';

const Router = require('koa-router');
const router = new Router();

const noop = require('./api/noop');
const stats = require('./api/stats');
const supply = require('./api/supply');
const price = require('./api/price');
const proxy = require('./api/proxy');
const gov = require('./api/stats/gov');
const smart = require('./api/smart');

router.get('/apy', stats.apy);
router.get('/smart', smart.getSmartcakeData);

router.get('/supply', supply.supply);
router.get('/supply/total', supply.total);
router.get('/supply/circulating', supply.circulating);

router.get('/earnings', gov.earnings);
router.get('/holders', gov.holderCount);

router.get('/pancake/price', proxy.pancake);
router.get('/thugs/tickers', proxy.thugs);

router.get('/pancake/lps', price.cakeLpPrices);
router.get('/thugs/lps', price.thugsLpPrices);
router.get('/bakery/lps', price.bakeryLpPrices);
router.get('/narwhal/lps', price.narLpPrices);
router.get('/jetfuel/lps', price.jetfuelLpPrices);

router.get('/', noop);

module.exports = router;
