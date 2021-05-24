const getTvl = require('../stats/getTvl');

async function vaultTvl(ctx) {
  try {
    const vaultTvl = await getTvl();
    ctx.status = 200;
    ctx.body = { ...vaultTvl };
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = {
  vaultTvl,
};
