'use strict';

import { initBifiBuyBackService } from './api/stats/bifibuyback/getBifiBuyback';
import { initPriceService } from './api/stats/getAmmPrices';
import { initApyService } from './api/stats/getApys';
import { initVaultService } from './api/stats/getMultichainVaults';
import { initTvlService } from './api/stats/getTvl';

require('./utils/redisHelper').initRedis();

const Koa = require('koa');
const helmet = require('koa-helmet');
const body = require('koa-bodyparser');
const cors = require('@koa/cors');
const conditional = require('koa-conditional-get');
const etag = require('koa-etag');

const rt = require('./middleware/rt');
const powered = require('./middleware/powered');
const router = require('./router');

const app = new Koa();

app.use(rt);
app.use(conditional());
app.use(etag());
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(powered);
app.use(body());

app.context.cache = {};

app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 3000;

const start = async () => {
  initApyService();
  initPriceService();
  initVaultService();
  initTvlService();
  initBifiBuyBackService();
  app.listen(port);
  console.log(`> beefy-api running! (:${port})`);
};

start();
