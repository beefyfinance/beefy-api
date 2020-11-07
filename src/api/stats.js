'use strict';

const axios = require('axios');
const { compound } = require('../utils/compound');
const getFryApys = require('../utils/getFryApys');
const getCakeLpApys = require('../utils/getCakeLpApys');
const getBaseCakeApy = require('../utils/getBaseCakeApy');

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
      apys[`fortube-${item.token_symbol.toLowerCase()}`] += parseFloat(item.deposit_interest_rate);
    });

    const fryApys = await getFryApys();
    apys['fry-burger-v2'] = compound(fryApys.burger, process.env.FRY_HPY, 1, 0.95);

    const baseCakeApy = await getBaseCakeApy();
    apys['cake-cake'] = compound(baseCakeApy, process.env.CAKE_HPY, 1, 0.94);

    const cakeLpApys = await getCakeLpApys();
    apys['cake-cake-bnb'] = compound(cakeLpApys['cake-cake-bnb'], process.env.CAKE_LP_HPY, 1, 0.955);
    apys['cake-bnb-busd'] = compound(cakeLpApys['cake-bnb-busd'], process.env.CAKE_LP_HPY, 1, 0.955);
    apys['cake-usdt-busd'] = compound(cakeLpApys['cake-usdt-busd'], process.env.CAKE_LP_HPY, 1, 0.955);
    apys['cake-bnb-btcb'] = compound(cakeLpApys['cake-bnb-btcb'], process.env.CAKE_LP_HPY, 1, 0.955);

    // FIXME: deprecated pools
    apys['cake-syrup-ctk'] = 0;
    apys['cake-syrup-twt'] = 0;
    apys['cake-syrup-inj'] = 0;
    apys['thugs-drugs-guns'] = 0;

    ctx.status = 200;
    ctx.body = apys;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = { apy };
