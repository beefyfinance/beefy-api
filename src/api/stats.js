'use strict';

const axios = require('axios');
const compound = require('../utils/compound');

async function apy(ctx) {
  try {
    const resSimple = await axios.get('https://bsc.for.tube/api/v2/bank_tokens');
    const resExtended = await axios.get('https://bsc.for.tube/api/v1/bank/markets?mode=extended', {
      headers: {
        authorization: process.env.FORTUBE_API_TOKEN,
      },
    });

    const dataSimple = resSimple.data;
    const dataExtended = resExtended.data.data;

    let apys = {};

    Object.values(dataSimple).map(item => {
      const symbol = item.symbol.toLowerCase();
      const apy = compound(parseFloat(item.estimated_ar));
      apys[symbol] = apy;
    });

    dataExtended.map(item => {
      apys[item.token_symbol.toLowerCase()] += parseFloat(item.deposit_interest_rate);
    });

    for (const key in apys) {
      apys[key] = `${(apys[key] * 100).toFixed(2)}%`;
    }

    ctx.status = 200;
    ctx.body = apys;
  } catch (err) {
    ctx.status = 500;
  }
}

module.exports = { apy };
