'use strict';
require('dotenv').config();

import { initCache } from './utils/cache';
import { initBoostService } from './api/boosts/getBoosts';
import { initPriceService } from './api/stats/getAmmPrices';
import { initApyService } from './api/stats/getApys';
import { initMooTokenPriceService } from './api/stats/getMooTokenPrices';
import { initVaultService } from './api/stats/getMultichainVaults';
import { initTvlService } from './api/stats/getTvl';
import { initTokenService } from './api/tokens/tokens';
import { initConfigService } from './api/config/getConfig';
import { initVaultFeeService } from './api/vaults/getVaultFees';
import { initTreasuryService } from './api/treasury/getTreasury';
import { initProposalsService } from './api/snapshot/getProposals';
import { initZapSwapService } from './api/zap/swap';
import { initValidatorPerformanceService } from './api/validators/validators';
import { initArticlesService } from './api/articles/fetchArticlesData';

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
  await initCache();

  initApyService();
  initPriceService();
  initValidatorPerformanceService();
  initVaultService();
  initBoostService();
  initVaultFeeService();
  initTvlService();
  initMooTokenPriceService();
  initTokenService();
  initConfigService();
  initProposalsService();
  initTreasuryService();
  initArticlesService();
  initZapSwapService();

  app.listen(port);
  console.log(`> beefy-api running! (:${port})`);
};

start();
