const { lpTokenPrices } = require('../../utils/lpTokens');
const cakeLpTokens = require('../../data/cakeLpPools.json');
const thugsLpTokens = require('../../data/thugsLpPools.json');
const bakeryLpTokens = require('../../data/bakeryLpPools.json');
const narLpTokens = require('../../data/narLpPools.json');
const jetfuelLpTokens = require('../../data/jetfuelLpPools.json');
const bdollarBdoLpTokens = require('../../data/bdollarBdoLpPools.json');
const bdollarSbdoLpTokens = require('../../data/bdollarSbdoLpPools.json');

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

async function narLpPrices(ctx) {
  await lpPrices(ctx, narLpTokens);
}

async function jetfuelLpPrices(ctx) {
  await lpPrices(ctx, jetfuelLpTokens);
}

async function bdollarLpPrices(ctx) {
  await lpPrices(ctx, [ ...bdollarBdoLpTokens, ...bdollarSbdoLpTokens ]);
}

module.exports = {
  cakeLpPrices,
  thugsLpPrices,
  bakeryLpPrices,
  narLpPrices,
  jetfuelLpPrices,
  bdollarLpPrices,
};
