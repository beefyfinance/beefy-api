'use strict';

async function logger(ctx, next) {
  console.log(`--> ${ctx.method} ${ctx.url}`);
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(
    `<-- ${ctx.method} ${ctx.url} | status: ${ctx.status} | len: ${ctx.length} | time: ${rt} \n`
  );
}

module.exports = logger;
