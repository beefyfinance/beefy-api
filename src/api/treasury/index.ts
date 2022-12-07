import { getBeefyTreasury } from './getTreasury';

export const getTreasury = ctx => {
  const chainTokens = getBeefyTreasury();
  ctx.status = 200;
  ctx.body = chainTokens;
};
