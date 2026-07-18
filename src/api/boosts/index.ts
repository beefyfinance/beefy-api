import { getLoggerFor } from '../../utils/logger/index.ts';
import { getAllNewBoosts, getAllOldBoosts, getChainNewBoosts, getChainOldBoosts } from './getBoosts.ts';

const logger = getLoggerFor({ module: 'boosts' });

export const boosts = async (ctx: any) => {
  try {
    const allBoosts = getAllOldBoosts();
    ctx.status = 200;
    ctx.body = [...allBoosts];
  } catch (err) {
    logger.error({ err }, 'failed to get boosts');
    ctx.status = 500;
  }
};

export const chainBoosts = async (ctx: any) => {
  try {
    const chainBoosts = getChainOldBoosts(ctx.params.chainId);
    ctx.status = 200;
    ctx.body = [...chainBoosts];
  } catch (err) {
    logger.error({ err, chain: ctx.params.chainId }, 'failed to get chain boosts');
    ctx.status = 500;
  }
};

export const boostsV2 = async (ctx: any) => {
  try {
    const allBoosts = getAllNewBoosts();
    ctx.status = 200;
    ctx.body = [...allBoosts];
  } catch (err) {
    logger.error({ err }, 'failed to get boosts');
    ctx.status = 500;
  }
};

export const chainBoostsV2 = async (ctx: any) => {
  try {
    const chainBoosts = getChainNewBoosts(ctx.params.chainId);
    ctx.status = 200;
    ctx.body = [...chainBoosts];
  } catch (err) {
    logger.error({ err, chain: ctx.params.chainId }, 'failed to get chain boosts');
    ctx.status = 500;
  }
};
