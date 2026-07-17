import { getBeefyTreasury } from './getTreasury';

export const getTreasury = ctx => {
  const chainTokens = getBeefyTreasury();
  if (chainTokens) {
    ctx.status = 200;
    ctx.body = chainTokens;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
};
