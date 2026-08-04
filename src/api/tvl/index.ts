import type { Context } from 'koa';
import { getLoggerFor } from '../../utils/logger/index.ts';
import { getTvl } from '../stats/getTvl.ts';

const logger = getLoggerFor({ module: 'tvl', component: 'routes' });

async function vaultTvl(ctx: Context) {
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
