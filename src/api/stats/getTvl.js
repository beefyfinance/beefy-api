import { getKey, setKey } from '../../utils/cache/index.ts';
import { SupportedChains } from '../../utils/chain';
import { getLoggerFor } from '../../utils/logger/index.js';
import { contextAllSettled, isContextResultFulfilled, isContextResultRejected } from '../../utils/promise';
import getChainTvl from './getChainTvl.js';

const logger = getLoggerFor({ module: 'tvl' });

const INIT_DELAY = Number(process.env.TVL_INIT_DELAY || 40 * 1000);
const REFRESH_INTERVAL = 15 * 60 * 1000;

let tvl = {};

const CACHE_KEY = 'TVL';

export const getTvl = () => {
  return tvl;
};

const updateTvl = async () => {
  logger.info('updating tvl');
  const start = Date.now();

  try {
    const results = await contextAllSettled(SupportedChains, getChainTvl);
    const fulfilled = results.filter(isContextResultFulfilled);

    for (const result of fulfilled) {
      tvl = { ...tvl, ...result.value };
    }

    if (fulfilled.length < results.length) {
      const rejected = results.filter(isContextResultRejected);
      rejected.forEach(r => {
        logger.debug({ err: r.reason, chain: r.context }, 'chain update failed');
      });

      if (fulfilled.length === 0) {
        logger.error({ durationMs: Date.now() - start }, 'all chains failed to update');
      } else {
        logger.warn(
          { durationMs: Date.now() - start, failed: rejected.map(r => r.context) },
          'updated with some failures'
        );
      }
    } else {
      logger.info({ durationMs: Date.now() - start }, 'updated tvl');
    }

    await saveToRedis();
  } catch (err) {
    logger.error({ err }, 'tvl update failed');
  }

  setTimeout(updateTvl, REFRESH_INTERVAL);
};

export const initTvlService = async () => {
  const cachedTvl = await getKey(CACHE_KEY);
  tvl = cachedTvl ?? {};

  setTimeout(updateTvl, INIT_DELAY);
};

const saveToRedis = async () => {
  await setKey(CACHE_KEY, tvl);
};
