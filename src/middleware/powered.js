async function rt(ctx, next) {
  await next();
  ctx.set('X-Powered-By', 'moo!');
}

export default rt;
