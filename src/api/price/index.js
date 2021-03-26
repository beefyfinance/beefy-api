const { getAmmTokensPrices, getAmmLpPrices } = require('../stats/getAmmPrices');
const getBeltVenusLpPrice = require('../stats/belt/getBeltVenusLpPrice');
const getEllipsis3PoolPrice = require('../stats/ellipsis/getEllipsis3PoolPrice');

async function lpsPrices(ctx) {
  try {
    const lpTokenPrices = await getAmmLpPrices();
    const beltVenusBLP = await getBeltVenusLpPrice();
    const eps3PoolLP = await getEllipsis3PoolPrice();
    ctx.status = 200;
    ctx.body = { ...lpTokenPrices, ...beltVenusBLP, ...eps3PoolLP };
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
