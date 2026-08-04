import cors from '@koa/cors';
import Koa from 'koa';
import body from 'koa-bodyparser';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import helmet from 'koa-helmet';
import { initArticlesService } from './api/articles/fetchArticlesData.ts';
import { initBoostService } from './api/boosts/getBoosts.ts';
import { initConfigService } from './api/config/getConfig.ts';
import { initCowcentratedService } from './api/cowcentrated/index.ts';
import { initOffchainRewardsService } from './api/offchain-rewards/index.ts';
import { initPointsStructureService } from './api/points/getPointsStructures.ts';
import { initProposalsService } from './api/snapshot/getProposals.ts';
import { initPriceService } from './api/stats/getAmmPrices.ts';
import { initApyService } from './api/stats/getApys.ts';
import { initMooTokenPriceService } from './api/stats/getMooTokenPrices.ts';
import { initVaultService } from './api/stats/getMultichainVaults.ts';
import { initTvlService } from './api/stats/getTvl.ts';
import { initTokenService } from './api/tokens/tokens.ts';
import { initTreasuryService } from './api/treasury/getTreasury.ts';
import { initVaultFeeService } from './api/vaults/getVaultFees.ts';
import { initZapSwapService } from './api/zap/swap/index.ts';
import powered from './middleware/powered.ts';
import rt from './middleware/rt.ts';
import router from './router.ts';
import { initCache } from './utils/cache/index.ts';
import { envNumber } from './utils/env.ts';
import { getLoggerFor } from './utils/logger/index.ts';

const logger = getLoggerFor({ module: 'app' });
const ERROR_STARTUP = 1;
const ERROR_UNHANDLED_REJECTION = 2;
const ERROR_UNHANDLED_EXCEPTION = 3;

function fatalExit(message: string, err: unknown, code: number) {
  logger.fatal({ err }, message);
  logger.flush();
  if (!process.exitCode) {
    process.exitCode = code;
    setTimeout(() => process.exit(code), 100).unref();
  }
}

async function startServices() {
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
}

function createApp() {
  const koa = new Koa();

  koa.use(rt);
  koa.use(conditional());
  koa.use(etag());
  koa.use(helmet());
  koa.use(cors({ origin: '*' }));
  koa.use(powered);
  koa.use(body());

  koa.context.cache = {};

  koa.use(router.routes());
  koa.use(router.allowedMethods());

  return koa;
}

function startListening(app: Koa) {
  logger.debug('starting to listen');
  const port = envNumber('PORT', 3000);
  app.listen(port);
  logger.info({ port }, 'beefy-api running');
}

async function start() {
  const app = createApp();
  await startServices();
  startListening(app);
}

process.on('unhandledRejection', (reason: unknown) => {
  fatalExit('unhandled promise rejection', reason, ERROR_UNHANDLED_REJECTION);
});

process.on('uncaughtException', (reason: unknown) => {
  fatalExit('uncaught exception', reason, ERROR_UNHANDLED_EXCEPTION);
});

start().catch(err => {
  fatalExit('app start failed', err, ERROR_STARTUP);
});
