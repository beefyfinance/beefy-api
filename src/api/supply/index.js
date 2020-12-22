'use strict';

function supply(ctx) {
  ctx.body = {
    total: 80000,
    circulating: 74000
  };
}

function total(ctx) {
  ctx.body = 80000;
}

function circulating(ctx) {
  ctx.body = 74000;
}

module.exports = { supply, total, circulating };
