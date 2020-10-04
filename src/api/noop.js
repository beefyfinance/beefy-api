'use strict';

async function noop(ctx, next) {
  ctx.status = 200;
}

module.exports = noop;
