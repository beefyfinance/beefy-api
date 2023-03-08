import Koa from 'koa';
import { getZapSupportByVault, getZapSupportByVaultDebug } from './zaps';

export function vaultZapSupport(ctx: Koa.Context) {
  const data = getZapSupportByVault();
  if (data) {
    ctx.status = 200;
    ctx.body = data;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
}

export function vaultZapSupportDebug(ctx: Koa.Context) {
  const data = getZapSupportByVaultDebug();
  if (data) {
    ctx.status = 200;
    ctx.body = data;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
}
