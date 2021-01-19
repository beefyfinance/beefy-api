'use strict';

const Koa = require('koa');
const helmet = require('koa-helmet');
const body = require('koa-bodyparser');
const cors = require('@koa/cors');

const logger = require('./middleware/logger');
const rt = require('./middleware/rt');
const powered = require('./middleware/powered');
const cache = require('./middleware/cache');
const router = require('./router');

const app = new Koa();
app.use(helmet());
app.use(cors({origin: '*'}));
// app.use(logger);
app.use(rt);
app.use(powered);
app.use(cache);
app.use(body());

app.context.cache = {};

app.use(router.routes());
app.use(router.allowedMethods());

console.log('> beefy-api running!');
app.listen(process.env.PORT);
