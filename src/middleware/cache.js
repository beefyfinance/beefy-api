'use strict';

const TTL = 3 * 60;

async function cache(ctx, next) {
  if (ctx.method !== 'GET') {
    return await next();
  }
  
  const cached = ctx.cache[ctx.path];
  if (cached !== undefined && cached.ts && cached.ts + TTL * 1000 > Date.now()) {
    ctx.status = 200;
    ctx.body = cached.body;
    return;
  }

  await next();

  ctx.set('Cache-Control', `public, max-age=${TTL}`);
  ctx.cache[ctx.path] = {
    ts: Date.now(),
    body: ctx.body,
  };
}

module.exports = cache;
