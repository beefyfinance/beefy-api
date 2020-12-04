'use strict';

const getApys = require('./getApys');

const TIMEOUT = 5 * 60 * 1000;

async function apy(ctx) {
  try {
    ctx.request.socket.setTimeout(TIMEOUT);
    let apys = await getApys();

    apys['cake-syrup-ctk'] = 0;
    apys['cake-syrup-twt'] = 0;
    apys['cake-syrup-inj'] = 0;

    ctx.status = 200;
    ctx.body = apys;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function supply(ctx) {
  try {
    ctx.request.socket.setTimeout(TIMEOUT);
    ctx.status = 200;

    const supply = {
      total: 80000,
      circulating: 74000
    }
    
    ctx.body = supply;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = { apy, supply };
