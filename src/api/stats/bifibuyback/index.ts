import { getBifiBuyback } from './getBifiBuyback';

const TIMEOUT = 5 * 60 * 1000;

export async function bifibuyback(ctx) {
  try {
    ctx.request.socket.setTimeout(TIMEOUT);
    let bifibuyback = await getBifiBuyback();

    if (!bifibuyback) {
      throw 'There is no bifibuyback data yet';
    }

    ctx.status = 200;
    ctx.body = bifibuyback;
  } catch (err) {
    ctx.throw(500, err);
  }
}
