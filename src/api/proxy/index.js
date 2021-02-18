'use strict';

const axios = require('axios');

async function pancake(ctx) {
  try {
    const rsp = await axios.get('https://api.pancakeswap.finance/api/v1/price');
    ctx.body = rsp.data;
    ctx.status = rsp.status;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

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

module.exports = { pancake, thugs };