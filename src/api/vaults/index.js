const getMultichainVaults = require('../stats/getMultichainVaults');
const getMultichainStakeVaults = require('../stats/getMultichainStakeVaults');

async function multichainVaults(ctx) {
  try {
    const multichainVaults = await getMultichainVaults();
    ctx.status = 200;
    ctx.body = [...multichainVaults];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function multichainStakeVaults(ctx) {
  try {
    const multichainStakeVaults = await getMultichainStakeVaults();
    ctx.status = 200;
    ctx.body = [...multichainStakeVaults];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = {
  multichainVaults,
  multichainStakeVaults,
};
