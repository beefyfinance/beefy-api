'use strict';

const Router = require('koa-router');
const router = new Router();

const noop = require('./api/noop');
const stats = require('./api/stats');

router.get('/apy', stats.apy);

module.exports = router;
