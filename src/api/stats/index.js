'use strict';

const getApys = require('./getApys');

const TIMEOUT = 5 * 60 * 1000;

async function apy(ctx) {
  console.time('stats');
  try {
    ctx.request.socket.setTimeout(TIMEOUT);
    let apys = await getApys();

    apys['cake-syrup-ctk'] = 0;
    apys['cake-syrup-twt'] = 0;
    apys['cake-syrup-inj'] = 0;
    apys['thugs-drugs-guns'] = 0;

    console.timeEnd('stats');
    ctx.status = 200;
    ctx.body = apys;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = { apy };
