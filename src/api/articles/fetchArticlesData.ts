import { getKey, setKey } from '../../utils/cache/index.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';
import type { ArticleInterface } from './types.ts';

const logger = getLoggerFor({ module: 'articles' });

const REDIS_KEY = 'ARTICLES';

let articles: ArticleInterface[] = [];

const INIT_DELAY = Number(process.env.BLOG_INIT_DELAY || 4 * 1000);
const REFRESH_INTERVAL = 12 * 60 * 1000;

export const getAllArticles = () => articles;

export const getLastArticle = () => articles[0];

export const updateArticles = async () => {
  try {
    logger.debug('updating articles');
    const start = Date.now();
    articles = await fetch('https://beefy.com/api/articles.json')
      .then(res => res.json())
      .then((res: ArticleInterface[]) => Object.values(res));

    await saveToRedis();
    logger.info({ durationMs: Date.now() - start, count: articles.length }, 'updated articles');
  } catch (err) {
    logger.warn({ err }, 'update failed');
  } finally {
    setTimeout(updateArticles, REFRESH_INTERVAL);
  }
};

async function loadFromRedis() {
  const cachedArticles = await getKey<ArticleInterface[]>(REDIS_KEY);

  if (cachedArticles && typeof cachedArticles === 'object') {
    articles = cachedArticles;
  }
}

async function saveToRedis() {
  await setKey(REDIS_KEY, articles);
}

export async function initArticlesService() {
  loadFromRedis().catch(err => logger.warn({ err }, 'failed to load from cache'));
  setTimeout(updateArticles, INIT_DELAY);
}
