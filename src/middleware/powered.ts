import type { Context, Next } from 'koa';

async function rt(ctx: Context, next: Next) {
  await next();
  ctx.set('X-Powered-By', 'moo!');
}

export default rt;
