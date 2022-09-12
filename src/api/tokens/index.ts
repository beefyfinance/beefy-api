import { getAllTokens, getSingleChainTokens } from './getTokens';

export const getTokens = ctx => {
  const allTokens = getAllTokens();
  ctx.status = 200;
  ctx.body = allTokens;
};

export const getChainTokens = ctx => {
  const chainTokens = getSingleChainTokens(ctx.params.chainId);
  ctx.status = 200;
  ctx.body = chainTokens;
};
