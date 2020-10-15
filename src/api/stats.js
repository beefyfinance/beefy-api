'use strict';

const axios = require('axios');
const { compound } = require('../utils/compound');

async function apy(ctx) {
  try {
    const resSimple = await axios.get(process.env.FORTUBE_REQ_TOKENS);
    const resExtended = await axios.get(process.env.FORTUBE_REQ_MARKETS, {
      headers: {
        authorization: process.env.FORTUBE_API_TOKEN,
      },
    });

    const dataSimple = resSimple.data;
    const dataExtended = resExtended.data.data;

    let apys = {};

    Object.values(dataSimple).map(item => {
      const symbol = item.symbol.toLowerCase();
      const apy = compound(parseFloat(item.estimated_ar), process.env.FORTUBE_HPY);
      apys[symbol] = apy;
    });

    dataExtended.map(item => {
      apys[item.token_symbol.toLowerCase()] += parseFloat(item.deposit_interest_rate);
    });

    // FIXME: fetch FRY APY from.... somewhere so we don't have to manually update it?
    apys['fry-wbnb'] = compound(process.env.FRY_WBNB_APY, process.env.FRY_HPY);
    apys['fry-busd'] = compound(process.env.FRY_BUSD_APY, process.env.FRY_HPY);

    for (const key in apys) {
      apys[key] = `${(apys[key] * 100).toFixed(2)}%`;
    }


    ctx.status = 200;
    ctx.body = apys;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = { apy };
