import { getKey, setKey } from '../../utils/cache';
import { ArticleInterface, ArticlesResponse } from './types';

const REDIS_KEY = 'ARTICLES';

let articles: ArticleInterface[] = [];

const INIT_DELAY = Number(process.env.BLOG_INIT_DELAY || 4 * 1000);
const REFRESH_INTERVAL = 12 * 60 * 1000;

export const getAllArticles = () => articles;

export const getLastArticle = () => articles[0];

export const updateArticles = async () => {
  console.log('> updating articles');
  const start = Date.now();
  try {
    articles = await fetch('https://beefy.com/api/articles.json')
      .then(res => res.json())
      .then((res: ArticleInterface[]) => Object.values(res));

    saveToRedis();
    console.log(`> updated articles (${(Date.now() - start) / 1000}s)`);
  } catch (err) {
    console.error(err);
  }
  setTimeout(updateArticles, REFRESH_INTERVAL);
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
  await loadFromRedis();
  setTimeout(updateArticles, INIT_DELAY);
}
