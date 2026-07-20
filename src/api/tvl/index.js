const { getTvl } = require('../stats/getTvl');
const { getLoggerFor } = require('../../utils/logger/index.js');

const logger = getLoggerFor({ module: 'tvl' });

async function vaultTvl(ctx) {
  try {
    const vaultTvl = await getTvl();
    ctx.status = 200;
    ctx.body = { ...vaultTvl };
  } catch (err) {
    logger.warn({ err }, 'failed to get tvl');
    ctx.status = 500;
  }
}

module.exports = {
  vaultTvl,
};
