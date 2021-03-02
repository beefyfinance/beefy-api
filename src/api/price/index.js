const { getAmmTokensPrices, getAmmLpPrices } = require('../stats/getAmmPrices');

// TODO: Remove all imports below in favor of getAmmPrices
const { lpTokenPrices } = require('../../utils/lpTokens');
const fetchPrice = require('../../utils/fetchPrice');
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
const spongeLpTokens = require('../../data/spongeLpPools.json');
const autoLpTokens = require('../../data/autoLpPools.json');
const mdexLpTokens = require('../../data/mdexLpPools.json');
const boltBtdLpTokens = require('../../data/boltBtdLpPools.json');
const boltBtsLpTokens = require('../../data/boltBtsLpPools.json');
const crowLpTokens = require('../../data/crowLpPools.json');
const midasLpTokens = require('../../data/midasLpPools.json');
const cafeLpTokens = require('../../data/cafeLpPools.json');
const ramenLpTokens = require('../../data/ramenLpPools.json');

async function lpsPrices(ctx) {
  try {
    const lpTokenPrices = await getAmmLpPrices();
    ctx.status = 200;
    ctx.body = lpTokenPrices;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

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

async function spongeLpPrices(ctx) {
  await lpPrices(ctx, spongeLpTokens);
}

async function autoLpPrices(ctx) {
  await lpPrices(ctx, autoLpTokens);
}

async function mdexLpPrices(ctx) {
  await lpPrices(ctx, mdexLpTokens);
}

async function boltLpPrices(ctx) {
  await lpPrices(ctx, boltBtdLpTokens);
  await lpPrices(ctx, [...boltBtdLpTokens, ...boltBtsLpTokens]);
}

async function crowLpPrices(ctx) {
  await lpPrices(ctx, crowLpTokens);
}

async function midasLpPrices(ctx) {
  await lpPrices(ctx, midasLpTokens);
}

async function cafeLpPrices(ctx) {
  await lpPrices(ctx, cafeLpTokens);
}

async function ramenLpPrices(ctx) {
  await lpPrices(ctx, ramenLpTokens);
}

async function bakeryPrices(ctx) {
  try {
    const price = await fetchPrice({ oracle: 'coingecko', id: 'binance-eth' });
    ctx.status = 200;
    ctx.body = { BETH: price };
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function nyanswopPrices(ctx) {
  try {
    const prices = await getAmmTokensPrices();
    ctx.status = 200;
    ctx.body = prices;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function tokenPrices(ctx) {
  try {
    const prices = await getAmmTokensPrices();
    ctx.status = 200;
    ctx.body = prices;
  } catch (err) {
    ctx.throw(500, err);
  }
}

module.exports = {
  lpsPrices,
  tokenPrices,
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
  spongeLpPrices,
  boltLpPrices,
  autoLpPrices,
  mdexLpPrices,
  crowLpPrices,
  midasLpPrices,
  cafeLpPrices,
  ramenLpPrices,
};
