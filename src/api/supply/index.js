function supply(ctx) {
  ctx.body = {
    total: 80000,
    circulating: 80000,
  };
}

function total(ctx) {
  ctx.body = 80000;
}

function circulating(ctx) {
  ctx.body = 80000;
}

export { circulating, supply, total };
