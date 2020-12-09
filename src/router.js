'use strict';

const Router = require('koa-router');
const router = new Router();

const noop = require('./api/noop');
const stats = require('./api/stats');
const price = require('./api/price');
const proxy = require('./api/proxy');
const gov = require('./api/stats/gov');

router.get('/apy', stats.apy);
router.get('/pancake/price', proxy.pancake);
router.get('/pancake/lps', price.lpPrices);
router.get('/earnings', gov.dailyEarn);
router.get('/', noop);

module.exports = router;
