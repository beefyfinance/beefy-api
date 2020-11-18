const getCakeLpPrices = require('./getCakeLpPrices');
const getThugsLpPrices = require('./getThugsLpPrices');

async function cakeLpsPrices(ctx) {
  try {
    const prices = await getCakeLpPrices();
    ctx.status = 200;
    ctx.body = prices;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function thugsLpsPrices(ctx) {
  try {
    const prices = await getThugsLpPrices();
    ctx.status = 200;
    ctx.body = prices;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = { cakeLpsPrices, thugsLpsPrices };
