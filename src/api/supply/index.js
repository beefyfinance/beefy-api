'use strict';

function supply(ctx) {
  ctx.body = {
    total: 70001,
    circulating: 70001,
  };
}

function total(ctx) {
  ctx.body = 70001;
}

function circulating(ctx) {
  ctx.body = 70001;
}

module.exports = { supply, total, circulating };
