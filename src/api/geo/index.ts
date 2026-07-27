import { getLoggerFor } from '../../utils/logger/index.js';
import { setNoCacheHeaders } from '../zap/proxy/common';

const logger = getLoggerFor({ module: 'geo' });

export const getCountry = async (ctx: any) => {
  try {
    const header = ctx.get('cf-ipcountry');
    const country = /^[A-Za-z]{2}$/.test(header) ? header.toUpperCase() : 'XX';
    setNoCacheHeaders(ctx);
    ctx.status = 200;
    ctx.body = { country };
  } catch (err) {
    logger.error({ err }, 'failed to get country');
    setNoCacheHeaders(ctx);
    ctx.status = 500;
  }
};
