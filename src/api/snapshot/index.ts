import { getLatestProposal } from './getLatestProposal';
import Koa from 'koa';

// latest proposal to display on app
function latest(ctx: Koa.Context) {
  try {
    const proposal = getLatestProposal();
    ctx.status = 200;
    ctx.body = proposal;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

export { latest };
