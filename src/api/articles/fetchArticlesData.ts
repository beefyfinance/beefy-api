import { keyBy } from 'lodash';
import { getKey, setKey } from '../../utils/cache';
import { ArticleConfig, ArticleInterface, ArticlesResponse } from './types';

const REDIS_KEY = 'ARTICLES';

let articles: Record<string, ArticleInterface> = {};

const ARTICLES_ENDPOINT = 'https://beefy.com/page-data/articles/page-data.json';

const INIT_DELAY = Number(process.env.BLOG_INIT_DELAY || 4 * 1000);
const REFRESH_INTERVAL = 12 * 60 * 1000;

export const getAllArticles = () => articles;

export const getArticlesByPage = async (page: number): Promise<ArticleConfig[]> => {
  return await fetch(`https://beefy.com/page-data/articles/page/${page}/page-data.json`)
    .then(res => res.json())
    .then((res: ArticlesResponse) => res.result.data.allMarkdownRemark.edges);
};

export const updateArticles = async () => {
  console.log('> updating articles');
  const start = Date.now();
  try {
    const result = await fetch(ARTICLES_ENDPOINT)
      .then(res => res.json())
      .then((res: ArticlesResponse) => res.result);

    const totalPages = result.pageContext.numPages;

    const allArticles = formatArticles(result.data.allMarkdownRemark.edges);

    let promises = [];

    for (let i = 1; i < totalPages; i++) {
      promises.push(getArticlesByPage(i + 1));
    }

    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status !== 'fulfilled') {
        console.warn('get articles error', result.reason);
        continue;
      }

      const formatted = formatArticles(result.value);
      allArticles.concat(formatted);
    }

    articles = allArticles.reduce((acc, article) => {
      const { id, ...rest } = article;
      acc[id] = rest;
      return acc;
    }, {} as Record<string, ArticleInterface>);

    saveToRedis();
    console.log(`> updated articles (${(Date.now() - start) / 1000}s)`);
  } catch (err) {
    console.error(err);
  }
  setTimeout(updateArticles, REFRESH_INTERVAL);
};

const formatArticles = (blogs: ArticleConfig[]) => {
  return blogs.map(blog => {
    const { title, date, short_description } = blog.node.frontmatter;

    return {
      id: blog.node.fields.slug,
      title,
      description: short_description,
      date: new Date(date).getTime() / 1000,
      url: `https://beefy.com/articles/${blog.node.fields.slug}`,
    };
  });
};

async function loadFromRedis() {
  const cachedArticles = await getKey<Record<string, ArticleInterface>>(REDIS_KEY);

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
