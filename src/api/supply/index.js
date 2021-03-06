'use strict';

function supply(ctx) {
  ctx.body = {
    total: 40000,
    circulating: 0
  };
}

function total(ctx) {
  ctx.body = 40000;
}

function circulating(ctx) {
  ctx.body = 0;
}

module.exports = { supply, total, circulating };
