'use strict';

const getApys = require('./getApys');

const TIMEOUT = 5 * 60 * 1000;

async function apy(ctx) {
  try {
    ctx.request.socket.setTimeout(TIMEOUT);
    let apys = await getApys();

    // FIXME: restoring partial service
    // if (Object.keys(apys).length === 0) {
    //   throw 'There is no APYs data yet'
    // }

    ctx.status = 200;
    ctx.body = apys;
  } catch (err) {
    ctx.throw(500, err);
  }
}

module.exports = { apy };
