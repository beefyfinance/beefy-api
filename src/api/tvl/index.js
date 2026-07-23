import { getLoggerFor } from '../../utils/logger/index.ts';
import { getTvl } from '../stats/getTvl.js';

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

export { vaultTvl };
