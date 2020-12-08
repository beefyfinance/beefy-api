const { lpTokenPrices } = require('../../utils/lpTokens');
const cakeLpTokens = require('../../data/cakeLpPools.json');
const thugsLpTokens = require('../../data/thugsLpPools.json');
const bakeryLpTokens = require('../../data/bakeryLpPools.json');

async function lpPrices(ctx, lpTokens) {
  try {
    const prices = await lpTokenPrices(lpTokens);
    ctx.status = 200;
    ctx.body = prices;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function cakeLpPrices(ctx) {
  await lpPrices(ctx, cakeLpTokens);
}

async function thugsLpPrices(ctx) {
  await lpPrices(ctx, thugsLpTokens);
}

async function bakeryLpPrices(ctx) {
  await lpPrices(ctx, bakeryLpTokens);
}

async function narwhalLpPrices(ctx) {
  // FIXME: implement proper lp price calc
  ctx.status = 200;
  ctx.body = {
    'narwhal-gold-bnb': 25.939,
    'narwhal-thugs-nar': 0.48467,
  };
}

module.exports = { cakeLpPrices, thugsLpPrices, bakeryLpPrices, narwhalLpPrices };
