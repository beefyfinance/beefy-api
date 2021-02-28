'use strict';

const Router = require('koa-router');
const router = new Router();

const noop = require('./api/noop');
const stats = require('./api/stats');
const supply = require('./api/supply');
const price = require('./api/price');
const gov = require('./api/stats/gov');
const cmc = require('./api/cmc');
const stake = require('./api/stake');

router.get('/apy', stats.apy);
router.get('/cmc', cmc.vaults);

router.get('/supply', supply.supply);
router.get('/supply/total', supply.total);
router.get('/supply/circulating', supply.circulating);

router.get('/earnings', gov.earnings);
router.get('/holders', gov.holderCount);

router.get('/stake', stake.data);
router.get('/lps', price.lpsPrices);
router.get('/prices', price.tokenPrices);

router.get('/pancake/price', price.tokenPrices);
router.get('/bakery/price', price.bakeryPrices);
router.get('/nyanswop/price', price.tokenPrices);

router.get('/pancake/lps', price.lpsPrices);
router.get('/thugs/lps', price.thugsLpPrices);
router.get('/bakery/lps', price.bakeryLpPrices);
router.get('/narwhal/lps', price.narLpPrices);
router.get('/jetfuel/lps', price.jetfuelLpPrices);
router.get('/bdollar/lps', price.bdollarLpPrices);
router.get('/helmet/lps', price.helmetLpPrices);
router.get('/kebab/lps', price.kebabLpPrices);
router.get('/monster/lps', price.monsterLpPrices);
router.get('/nyanswop/lps', price.nyanswopLpPrices);
router.get('/sponge/lps', price.spongeLpPrices);
router.get('/auto/lps', price.autoLpPrices);
router.get('/mdex/lps', price.mdexLpPrices);
router.get('/bolt/lps', price.boltLpPrices);
router.get('/crow/lps', price.crowLpPrices);
router.get('/midas/lps', price.midasLpPrices);
router.get('/cafe/lps', price.cafeLpPrices);
router.get('/ramen/lps', price.ramenLpPrices);

router.get('/', noop);

module.exports = router;
