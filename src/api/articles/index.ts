import { getAllArticles } from './fetchArticlesData';

export const getArticles = async (ctx: any) => {
  try {
    const allArticles = getAllArticles();
    ctx.status = 200;
    ctx.body = { ...allArticles };
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
};
