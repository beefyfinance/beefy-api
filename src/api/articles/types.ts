export type ArticlesResponse = ArticleInterface[];

export interface ArticleInterface {
  id: string;
  title: string;
  description: string;
  date: number;
  url: string;
}
