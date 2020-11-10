'use strict';

const axios = require('axios');
const { compound } = require('../../utils/compound');
const getFryApys = require('./fry/getFryApys');
const getCakeApys = require('./pancake/getCakeApys');
const getCakeLpApys = require('./pancake/getCakeLpApys');
const getBaseCakeApy = require('./pancake/getBaseCakeApy');

const TIMEOUT = 5 * 60 * 1000;

async function apy(ctx) {
  try {
    ctx.request.socket.setTimeout(TIMEOUT);

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
    apys['cake-busd-bnb'] = compound(cakeLpApys['cake-busd-bnb'], process.env.CAKE_LP_HPY, 1, 0.955);
    apys['cake-usdt-busd'] = compound(cakeLpApys['cake-usdt-busd'], process.env.CAKE_LP_HPY, 1, 0.955);
    apys['cake-btcb-bnb'] = compound(cakeLpApys['cake-btcb-bnb'], process.env.CAKE_LP_HPY, 1, 0.955);

    const cakeApys = await getCakeApys();
    apys['cake-hard'] = compound(cakeApys['cake-hard'], process.env.CAKE_HPY, 1, 0.94);
    apys['cake-broobee'] = compound(cakeApys['cake-broobee'], process.env.CAKE_HPY, 1, 0.94);
    apys['cake-stax'] = compound(cakeApys['cake-stax'], process.env.CAKE_HPY, 1, 0.94);
    apys['cake-nya'] = compound(cakeApys['cake-nya'], process.env.CAKE_HPY, 1, 0.94);

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
