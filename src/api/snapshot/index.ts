import type Koa from 'koa';
import { getLoggerFor } from '../../utils/logger/index.ts';
import { getActiveProposals, getLatestProposal } from './getProposals.ts';

const logger = getLoggerFor({ module: 'snapshot' });

// latest proposal to display on app
function latest(ctx: Koa.Context) {
  try {
    const proposal = getLatestProposal();
    ctx.status = 200;
    ctx.body = proposal;
  } catch (err) {
    logger.error({ err }, 'failed to get latest proposal');
    ctx.status = 500;
  }
}

function active(ctx: Koa.Context) {
  try {
    const activeProposals = getActiveProposals();
    ctx.status = 200;
    ctx.body = activeProposals;
  } catch (err) {
    logger.error({ err }, 'failed to get active proposals');
    ctx.status = 500;
  }
}

export { active, latest };
