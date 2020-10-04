'use strict';

const TTL = 30 * 60;

async function cache(ctx, next) {
  if (ctx.method !== 'GET') {
    return await next();
  }
  
  const cached = ctx.cache[ctx.url];
  console.log('>>>>', 'cached', cached);

  if (cached !== undefined && cached.ts && (cached.ts + TTL * 1000) > Date.now()) {
    console.log('>>>>', 'cache hit');
    ctx.status = 200;
    ctx.body = cached.body;
    return;
  }
  console.log('>>>>', 'cache miss');
  
  await next();
  
  ctx.set('Cache-Control', `public, max-age=${TTL}`);
  ctx.cache[ctx.url] = {
    ts: Date.now(),
    body: ctx.body,
  } 
}

module.exports = cache;
