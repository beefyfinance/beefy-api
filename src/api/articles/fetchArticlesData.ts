import { getKey, setKey } from '../../utils/cache';
import { ArticleInterface } from './types';

const REDIS_KEY = 'ARTICLES';

let articles: ArticleInterface[] = [];

const INIT_DELAY = Number(process.env.BLOG_INIT_DELAY || 4 * 1000);
const REFRESH_INTERVAL = 12 * 60 * 1000;

export const getAllArticles = () => articles;

export const getLastArticle = () => articles[0];

export const updateArticles = async () => {
  try {
    console.log('> [News] updating articles');
    const start = Date.now();
    articles = await fetch('https://beefy.com/api/articles.json')
      .then(res => res.json())
      .then((res: ArticleInterface[]) => Object.values(res));

    await saveToRedis();
    console.log(`> [News] updated articles (${(Date.now() - start) / 1000}s)`);
  } catch (err) {
    console.error('[News] update failed', err);
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
  loadFromRedis().catch(err => console.error('[News] Failed to load from cache', err));
  setTimeout(updateArticles, INIT_DELAY);
}
