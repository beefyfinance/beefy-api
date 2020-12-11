const dailyEarnings = require('./getEarnings');
const holderCount = require('./getHolderCount');

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

async function holderCounter(ctx) {
  try {
    const holders = await holderCount();

    ctx.status = 200;
    ctx.body = holders;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}


module.exports = { dailyEarn, holderCounter };
