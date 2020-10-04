'use strict';

async function noop(ctx, next) {
  console.log(`NOOP: ${ctx.url} NOT IMPLEMENTED YET!`);
  ctx.status = { status: 200, msg: 'noop' };
}

module.exports = noop;
