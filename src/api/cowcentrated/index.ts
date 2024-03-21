import { getCowcentratedData } from './getCowcentratedData';

export const getCowcentratedVaultData = ctx => {
  const chainTokens = getCowcentratedData();
  if (chainTokens) {
    ctx.status = 200;
    ctx.body = chainTokens;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
};
