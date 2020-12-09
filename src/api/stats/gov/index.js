const dailyEarnings = require('./getEarnings');

async function dailyEarn(ctx) {
  try {
    const dailyEarn = await dailyEarnings();

    ctx.status = 200;
    ctx.body = dailyEarn;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = { dailyEarn };
