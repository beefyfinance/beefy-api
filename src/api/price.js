'use strict';

const axios = require('axios');
const getCakeLpPrices = require('../utils/getCakeLpPrices');

async function lpPrices(ctx) {
  try {
    const prices = await getCakeLpPrices();

    ctx.status = 200;
    ctx.body = prices;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = { lpPrices };
