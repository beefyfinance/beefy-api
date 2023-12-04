import { getKey, setKey } from '../../utils/cache';
import { ArticleConfig, ArticleInterface, ArticlesResponse } from './types';

const REDIS_KEY = 'ARTICLES';

let articles: ArticleInterface[] = [];

const ARTICLES_ENDPOINT = 'https://beefy.com/page-data/articles/page-data.json';

const INIT_DELAY = Number(process.env.BLOG_INIT_DELAY || 4 * 1000);
const REFRESH_INTERVAL = 12 * 60 * 1000;

export const getAllArticles = () => articles;

export const getArticlesByPage = async (page: number): Promise<ArticleConfig[]> => {
  const endpont =
    page === 1
      ? ARTICLES_ENDPOINT
      : `https://beefy.com/page-data/articles/page/${page}/page-data.json`;

  return await fetch(endpont)
    .then(res => res.json())
    .then((res: ArticlesResponse) => res.result.data.allMarkdownRemark.edges);
};

export const updateArticles = async () => {
  console.log('> updating articles');
  const start = Date.now();
  try {
    const totalPages = await fetch(ARTICLES_ENDPOINT)
      .then(res => res.json())
      .then((res: ArticlesResponse) => res.result.pageContext.numPages);

    let promises = [];

    for (let i = 0; i < totalPages; i++) {
      promises.push(getArticlesByPage(i + 1));
    }

    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status !== 'fulfilled') {
        console.warn('get articles error', result.reason);
        continue;
      }

      const blogs = formatBlogs(result.value);

      articles = [...articles, ...blogs];
    }

    saveToRedis();
    console.log(`> updated articles (${(Date.now() - start) / 1000}s)`);
    setTimeout(updateArticles, REFRESH_INTERVAL);
  } catch (err) {
    console.error(err);
    return [];
  }
};

const formatBlogs = (blogs: ArticleConfig[]) => {
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
