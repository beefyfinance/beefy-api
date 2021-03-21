const { getAmmTokensPrices, getAmmLpPrices } = require('../stats/getAmmPrices');
const getBeltVenusLpPrice = require('../stats/belt/getBeltVenusLpPrice');

async function lpsPrices(ctx) {
  try {
    const lpTokenPrices = await getAmmLpPrices();
    const beltVenusBLP = await getBeltVenusLpPrice();
    ctx.status = 200;
    ctx.body = { ...lpTokenPrices, ...beltVenusBLP };
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
};
