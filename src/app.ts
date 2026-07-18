import { initCache } from './utils/cache/index.ts';
import { initBoostService } from './api/boosts/getBoosts.ts';
import { initPriceService } from './api/stats/getAmmPrices.ts';
import { initApyService } from './api/stats/getApys.js';
import { initMooTokenPriceService } from './api/stats/getMooTokenPrices.ts';
import { initVaultService } from './api/stats/getMultichainVaults.ts';
import { initTvlService } from './api/stats/getTvl.js';
import { initTokenService } from './api/tokens/tokens.ts';
import { initConfigService } from './api/config/getConfig.ts';
import { initVaultFeeService } from './api/vaults/getVaultFees.ts';
import { initTreasuryService } from './api/treasury/getTreasury.ts';
import { initProposalsService } from './api/snapshot/getProposals.ts';
import { initZapSwapService } from './api/zap/swap/index.ts';
import { initArticlesService } from './api/articles/fetchArticlesData.ts';
import { initCowcentratedService } from './api/cowcentrated/index.ts';
import { initOffchainRewardsService } from './api/offchain-rewards/index.ts';
import { initPointsStructureService } from './api/points/getPointsStructures.ts';
import { getLoggerFor } from './utils/logger/index.ts';
import Koa from 'koa';
import helmet from 'koa-helmet';
import body from 'koa-bodyparser';
import cors from '@koa/cors';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import rt from './middleware/rt.js';
import powered from './middleware/powered.js';
import router from './router.js';

const logger = getLoggerFor({ module: 'app' });

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
  initCowcentratedService();
  initOffchainRewardsService();
  initPointsStructureService();

  app.listen(port);
  logger.info({ port }, 'beefy-api running');
};

start();
