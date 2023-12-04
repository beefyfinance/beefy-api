import Koa from 'koa';
import { getDebugTokenSwapSupport, getTokenSwapSupport } from './index';

export function zapSwapsSupport(ctx: Koa.Context) {
  const data = getTokenSwapSupport();
  if (data) {
    ctx.status = 200;
    ctx.body = data;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
}

export function zapSwapsSupportDebug(ctx: Koa.Context) {
  const data = getDebugTokenSwapSupport();
  if (data) {
    ctx.status = 200;
    ctx.body = data;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
}
