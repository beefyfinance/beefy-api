import { getAllBeefyHoldings, getBeefyTreasury, getMarketMakerBalances } from './getTreasury';

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

export const getMMBal = ctx => {
  const chainTokens = getMarketMakerBalances();
  if (chainTokens) {
    ctx.status = 200;
    ctx.body = chainTokens;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
};

export const getAllTreasury = ctx => {
  const chainTokens = getAllBeefyHoldings();
  if (chainTokens) {
    ctx.status = 200;
    ctx.body = chainTokens;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
};
