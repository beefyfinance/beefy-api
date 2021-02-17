'use strict';

const axios = require('axios');

async function thugs(ctx) {
  try {
    const rsp = await axios.get('https://api.streetswap.vip/tickers');
    ctx.body = rsp.data;
    ctx.status = rsp.status;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = { thugs };
