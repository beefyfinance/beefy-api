'use strict';

async function rt(ctx, next) {
  console.log('origin', ctx.request.headers['X-Saved-Origin']);
  await next();
  ctx.set('X-Powered-By', 'moo!');
}

module.exports = rt;
