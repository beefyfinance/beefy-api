'use strict';

const Router = require('koa-router');
const router = new Router();

const noop = require('./api/noop');
const stats = require('./api/stats');
const proxy = require('./api/proxy');

router.get('/apy', stats.apy);
router.get('/proxy/pancake', proxy.pancake);
router.get('/', noop);

module.exports = router;
