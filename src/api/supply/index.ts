import type { Context } from 'koa';

function supply(ctx: Context) {
  ctx.body = {
    total: 80000,
    circulating: 80000,
  };
}

function total(ctx: Context) {
  ctx.body = 80000;
}

function circulating(ctx: Context) {
  ctx.body = 80000;
}

export { circulating, supply, total };
