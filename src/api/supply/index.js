'use strict';

function supply(ctx) {
  ctx.body = {
    total: 80000,
    circulating: 78000,
  };
}

function total(ctx) {
  ctx.body = 80000;
}

function circulating(ctx) {
  ctx.body = 78000;
}

module.exports = { supply, total, circulating };
