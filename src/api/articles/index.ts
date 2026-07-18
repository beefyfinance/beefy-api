import { getLoggerFor } from '../../utils/logger/index.ts';
import { getAllArticles, getLastArticle } from './fetchArticlesData.ts';

const logger = getLoggerFor({ module: 'articles' });

export const getArticles = async (ctx: any) => {
  try {
    const allArticles = getAllArticles();
    ctx.status = 200;
    ctx.body = [...allArticles];
  } catch (err) {
    logger.error({ err }, 'failed to get articles');
    ctx.status = 500;
  }
};

export const getLatestArticle = async (ctx: any) => {
  try {
    const lastArticle = getLastArticle();
    ctx.status = 200;
    ctx.body = lastArticle;
  } catch (err) {
    logger.error({ err }, 'failed to get latest article');
    ctx.status = 500;
  }
};
