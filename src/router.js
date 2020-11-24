'use strict';

const Router = require('koa-router');
const router = new Router();

const noop = require('./api/noop');
const stats = require('./api/stats');
const price = require('./api/price');
const proxy = require('./api/proxy');
const smart = require('./api/smart');

router.get('/apy', stats.apy);
router.get('/smart', smart.getSmartcakeData);
router.get('/pancake/price', proxy.pancake);
router.get('/pancake/lps', price.cakeLpsPrices);
router.get('/thugs/lps', price.thugsLpsPrices);
router.get('/thugs/tickers', proxy.thugs);
router.get('/', noop);

module.exports = router;
