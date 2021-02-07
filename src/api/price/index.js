const { lpTokenPrices } = require('../../utils/lpTokens');
const { getPrice } = require('../../utils/getPrice');
const { getNyanswopTokenPrices } = require('../stats/nyanswop/getNyanswopPrice')
const cakeLpTokens = require('../../data/cakeLpPools.json');
const thugsLpTokens = require('../../data/thugsLpPools.json');
const bakeryLpTokens = require('../../data/bakeryLpPools.json');
const narLpTokens = require('../../data/narLpPools.json');
const jetfuelLpTokens = require('../../data/jetfuelLpPools.json');
const bdollarBdoLpTokens = require('../../data/bdollarBdoLpPools.json');
const bdollarSbdoLpTokens = require('../../data/bdollarSbdoLpPools.json');
const helmetLpTokens = require('../../data/helmetLpPools.json');
const kebabLpTokens = require('../../data/kebabLpPools.json');
const monsterLpTokens = require('../../data/monsterLpPools.json');
const nyanswopLpTokens = require('../../data/nyanswopLpPools.json');

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
  await lpPrices(ctx, [...bdollarBdoLpTokens, ...bdollarSbdoLpTokens]);
}

async function helmetLpPrices(ctx) {
  await lpPrices(ctx, helmetLpTokens);
}

async function kebabLpPrices(ctx) {
  await lpPrices(ctx, kebabLpTokens);
}

async function monsterLpPrices(ctx) {
  await lpPrices(ctx, monsterLpTokens);
}

async function nyanswopLpPrices(ctx) {
  await lpPrices(ctx, nyanswopLpTokens);
}

async function bakeryPrices(ctx) {
  try {
    const price = await getPrice('bakery', 'BETH');
    ctx.status = 200;
    ctx.body = { BETH: price };
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function nyanswopPrices(ctx) {
  try {
    const prices = await getNyanswopTokenPrices();
    ctx.status = 200;
    ctx.body = prices;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = {
  cakeLpPrices,
  thugsLpPrices,
  bakeryLpPrices,
  narLpPrices,
  jetfuelLpPrices,
  bdollarLpPrices,
  bakeryPrices,
  nyanswopPrices,
  helmetLpPrices,
  kebabLpPrices,
  monsterLpPrices,
  nyanswopLpPrices,
};
