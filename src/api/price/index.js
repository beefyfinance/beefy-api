import { getAmmTokensPrices, getAmmLpPrices, getLpBreakdown } from '../stats/getAmmPrices.ts';
import { getMooTokenPrices } from '../stats/getMooTokenPrices.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';

const logger = getLoggerFor({ module: 'prices' });

async function lpsPrices(ctx) {
  try {
    const lpTokenPrices = await getAmmLpPrices();
    ctx.status = 200;
    ctx.body = { ...lpTokenPrices };
  } catch (err) {
    logger.warn({ err }, 'failed to get lp prices');
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

async function mooTokenPrices(ctx) {
  try {
    const prices = await getMooTokenPrices();
    ctx.status = 200;
    ctx.body = prices;
  } catch (err) {
    ctx.throw(500, err);
  }
}

async function lpsBreakdown(ctx) {
  try {
    const lpTokenBreakdown = await getLpBreakdown();
    ctx.status = 200;
    ctx.body = { ...lpTokenBreakdown };
  } catch (err) {
    logger.warn({ err }, 'failed to get lp breakdown');
    ctx.status = 500;
  }
}

export {
  lpsPrices,
  tokenPrices,
  mooTokenPrices,
  lpsBreakdown,
};
