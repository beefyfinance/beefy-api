export interface ArticlesResponse {
  componentChunkName: string;
  path: string;
  result: {
    data: {
      allMarkdownRemark: {
        edges: Array<ArticleConfig>;
      };
    };
    pageContext: { limit: number; skip: number; numPages: number; currentPage: number };
  };
  staticQueryHashes: Array<string>;
}

export interface ArticleConfig {
  node: {
    id: string;
    frontmatter: {
      title: string;
      date: string;
      short_description: string;
      sub_header: string;
      header_image: {
        childImageSharp: {
          gatsbyImageData: {
            layout: string;
            placeholder: {
              fallback: string;
            };
            images: {
              fallback: {
                src: string;
                srcSet: string;
                sizes: string;
              };
              sources: [
                {
                  srcSet: string;
                  type: string;
                  sizes: string;
                }
              ];
            };
            width: number;
            height: number;
          };
        };
      };
    };
    fields: {
      slug: string;
    };
  };
}

export interface ArticleInterface {
  title: string;
  description: string;
  date: number;
  url: string;
}
