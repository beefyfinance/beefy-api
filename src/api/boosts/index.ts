import { getLoggerFor } from '../../utils/logger/index.ts';
import { withChainId } from '../vaults/helpers.ts';
import { getAllNewBoosts, getAllOldBoosts, getChainNewBoosts, getChainOldBoosts } from './getBoosts.ts';

const logger = getLoggerFor({ module: 'boosts', component: 'routes' });

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

export const chainBoosts = withChainId(async (ctx, chainId) => {
  ctx.status = 200;
  ctx.body = getChainOldBoosts(chainId);
});

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

export const chainBoostsV2 = withChainId(async (ctx, chainId) => {
  ctx.status = 200;
  ctx.body = [...getChainNewBoosts(chainId)];
});
