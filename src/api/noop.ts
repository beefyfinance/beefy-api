async function noop(ctx, next) {
  ctx.status = 200;
}

export default noop;
