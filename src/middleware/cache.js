'use strict';

const redis = require('redis');

const TTL = 5 * 60;

function cache(options) {
  const client = redis.createClient(options);

  client.on('error', err => {
    console.log('Redis error', err);
  });

  return async (ctx, next) => {
    if (ctx.method !== 'GET') {
      return await next();
    }

    if (!client.isOpen) {
      await client.connect();
    }

    const cached = await client.get(ctx.url);
    if (cached !== null) {
      ctx.status = 200;
      ctx.body = JSON.parse(cached);
      return;
    }

    await next();

    ctx.set('Cache-Control', `public, max-age=${TTL}`);
    client.set(ctx.url, JSON.stringify(ctx.body), { EX: TTL });
  };
}

module.exports = cache;
