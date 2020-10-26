'use strict';

const axios = require('axios');
const { compound } = require('../utils/compound');
const getFryApys = require('../utils/getFryApys');
const getCakeApys = require('../utils/getCakeApys');

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
      const apy = compound(parseFloat(item.estimated_ar), process.env.FORTUBE_HPY, 1, 0.95);
      apys[symbol] = apy;
    });

    dataExtended.map(item => {
      apys[item.token_symbol.toLowerCase()] += parseFloat(item.deposit_interest_rate);
    });

    const fryApys = await getFryApys();

    apys['fry-burger-v2'] = compound(fryApys.burger, process.env.FRY_HPY, 1, 0.95);
    apys['fry-wbnb-v2'] = compound(fryApys.wbnb, process.env.FRY_HPY, 1, 0.95);
    apys['fry-busd-v2'] = compound(fryApys.busd, process.env.FRY_HPY, 1, 0.95);

    // TODO: remove these after they deprecate
    apys['fry-burger-v1'] = apys['fry-burger-v2'];
    apys['fry-wbnb-v1'] = apys['fry-wbnb-v2'];
    apys['fry-busd-v1'] = apys['fry-busd-v2'];

    const cakeApys = await getCakeApys();

    apys['cake-sxp'] = compound(cakeApys.sxp, 365, 1, 0.95);
    apys['cake-twt'] = compound(cakeApys.twt, 365, 1, 0.95);
    apys['cake-inj'] = compound(cakeApys.inj, 365, 1, 0.95);

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
