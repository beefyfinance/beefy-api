const { fetchAmmPoolsPrices } = require('../../utils/getPoolStats');
const { sleep } = require('../../utils/time');

const bakeryPools = require('../../data/bakeryLpPools.json');
const blizzardLpPools = require('../../data/blizzardLpPools.json');
const cafePools = require('../../data/cafeLpPools.json');
const cakeLpPools = require('../../data/cakeLpPools.json');
const cakePools = require('../../data/cakePools.json');
const jetfuelPools = require('../../data/jetfuelLpPools.json');
const kebabPools = require('../../data/kebabLpPools.json');
const bdollarSbdoPools = require('../../data/bdollarSbdoLpPools.json');
const boltBtdPools = require('../../data/boltBtdLpPools.json');
const boltBtsPools = require('../../data/boltBtsLpPools.json');
const helmetPools = require('../../data/helmetLpPools.json');
const mdexPools = require('../../data/mdexLpPools.json');
const midasPools = require('../../data/midasLpPools.json');
const monsterPools = require('../../data/monsterLpPools.json');
const narPools = require('../../data/narLpPools.json');
const nyacashPools = require('../../data/nyacashLpPools.json');
const nyanswopPools = require('../../data/nyanswopLpPools.json');
const ramenPools = require('../../data/ramenLpPools.json');
const thugsPools = require('../../data/thugsLpPools.json');
const spongePools = require('../../data/spongeLpPools.json');
const crowPools = require('../../data/crowLpPools.json');
const inchPools = require('../../data/1inchLpPools.json');
const saltPools = require('../../data/degens/saltLpPools.json');
const apePools = require('../../data/degens/apeLpPools.json');
const soupPools = require('../../data/degens/soupLpPools.json');
const autoPools = require('../../data/autoLpPools.json');
const julPools = require('../../data/julLpPools.json');
const memePools = require('../../data/degens/memeFarmLpPools.json');
const nutsPools = require('../../data/degens/nutsLpPools.json');
const slimePools = require('../../data/degens/slimeLpPools.json');
const pangolinPools = require('../../data/pangolinLpPools.json');
const swipePools = require('../../data/swipeLpPools.json');
const comAvaxPools = require('../../data/comAvaxLpPools.json');
const comBscPools = require('../../data/comBscLpPools.json');
const snowballPools = require('../../data/snobLpPools.json');
const supernovaPools = require('../../data/supernovaLpPools.json')

const INIT_DELAY = 30 * 1000;
const REFRESH_INTERVAL = 10 * 60 * 1000;

// FIXME: if this list grows too big we might hit the ratelimit on initialization everytime
// Implement in case of emergency -> https://github.com/beefyfinance/beefy-api/issues/103 
const pools = [
  ...supernovaPools,
  ...snowballPools,
  ...comBscPools,
  ...comAvaxPools,
  ...pangolinPools,
  ...swipePools,
  ...slimePools,
  ...blizzardLpPools,
  ...nutsPools,
  ...memePools,
  ...julPools,
  ...autoPools,
  ...soupPools,
  ...apePools,
  ...saltPools,
  ...inchPools,
  ...crowPools,
  ...ramenPools,
  ...cafePools,
  ...midasPools,
  ...bdollarSbdoPools,
  ...spongePools,
  ...bakeryPools,
  ...jetfuelPools,
  ...kebabPools,
  ...boltBtdPools,
  ...boltBtsPools,
  ...helmetPools,
  ...mdexPools,
  ...monsterPools,
  ...narPools,
  ...nyacashPools,
  ...nyanswopPools,
  ...thugsPools,
  ...cakeLpPools,
  ...cakePools,
];

const knownPrices = {
  BUSD: 1,
  USDT: 1,
  HUSD: 1,
  DAI: 1,
  USDC: 1,
  UST: 1,
};

let tokenPricesCache = {};
let lpPricesCache = {};
let isProcessing = true;

const updateAmmPrices = async () => {
  console.log('> updating amm prices');
  isProcessing = true;
  try {
    let { poolPrices, tokenPrices } = await fetchAmmPoolsPrices(pools, knownPrices);
    tokenPricesCache = tokenPrices;
    lpPricesCache = poolPrices;
  } catch (err) {
    console.error(err);
  }
  isProcessing = false;

  setTimeout(updateAmmPrices, REFRESH_INTERVAL);
  console.log('> updated amm prices');
};

const getAmmTokensPrices = async () => {
  // TODO: can we replace this mutex with events system?  
  while (isProcessing) { await sleep(500); }
  return tokenPricesCache;
};

const getAmmLpPrices = async () => {
  while (isProcessing) { await sleep(500); }
  return lpPricesCache;
};

// Flexible delayed initialization used to work around ratelimits
setTimeout(updateAmmPrices, INIT_DELAY);

module.exports = {
  getAmmTokensPrices,
  getAmmLpPrices,
};
