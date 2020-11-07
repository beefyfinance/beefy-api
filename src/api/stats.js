'use strict';

const axios = require('axios');
const { compound } = require('../utils/compound');
const getFryApys = require('../utils/getFryApys');
const getCakeApys = require('../utils/getCakeApys');
const getBaseCakeApy = require('../utils/getBaseCakeApy');
const getDrugsApys = require('../utils/getDrugsApys');

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
      apys[`fortube-${symbol}`] = apy;
    });

    dataExtended.map(item => {
      apys[item.token_symbol.toLowerCase()] += parseFloat(item.deposit_interest_rate);
    });

    const fryApys = await getFryApys();
    apys['fry-burger-v2'] = compound(fryApys.burger, process.env.FRY_HPY, 1, 0.95);

    const baseCakeApy = await getBaseCakeApy();
    apys['cake-cake'] = compound(baseCakeApy, process.env.CAKE_HPY, 1, 0.94);

    const cakeApys = await getCakeApys();
    apys['cake-syrup-ctk'] = compound(cakeApys.ctk, process.env.CAKE_HPY, 1, 0.95);
    apys['cake-syrup-twt'] = compound(cakeApys.twt, process.env.CAKE_HPY, 1, 0.95);
    apys['cake-syrup-inj'] = compound(cakeApys.inj, process.env.CAKE_HPY, 1, 0.95);

    const drugsApys = await getDrugsApys();
    apys['thugs-drugs-guns'] = compound(drugsApys.guns, process.env.DRUGS_HPY, 1, 0.95);

    ctx.status = 200;
    ctx.body = apys;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = { apy };
