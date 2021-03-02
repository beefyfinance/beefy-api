const { fetchAmmPoolsPrices } = require('../../utils/getPoolStats');

const bakeryPools = require('../../data/bakeryLpPools.json');
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
const nyacashPools = require('../../data/nyacashLpPools.json');
const nyanswopPools = require('../../data/nyanswopLpPools.json');
const ramenPools = require('../../data/ramenLpPools.json');
const thugsPools = require('../../data/thugsLpPools.json');
const spongePools = require('../../data/spongeLpPools.json');
const crowPools = require('../../data/crowLpPools.json');
const inchPools = require('../../data/1inchLpPools.json');
const saltPools = require('../../data/degens/saltLpPools.json');

const pools = [
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

const refreshInterval = 10 * 60 * 1000;
let tokenPricesCache = {};
let lpPricesCache = {};
let isProcessing = false;

const fetchCakeTokensPrices = async () => {
  isProcessing = true;
  try {
    let {poolPrices, tokenPrices} = await fetchAmmPoolsPrices(pools, knownPrices);
    tokenPricesCache = tokenPrices;
    lpPricesCache = poolPrices;
  } catch (err) {
    console.error(err);
  }
  isProcessing = false;
};
fetchCakeTokensPrices();

const fetchInterval = setInterval(() => {
  if (!isProcessing) {
    fetchCakeTokensPrices();
  }
}, refreshInterval);

const getAmmTokensPrices = async () => {
  while (isProcessing) {
    await sleep(500);
  }
  return tokenPricesCache;
};

const getAmmLpPrices = async () => {
  while (isProcessing) {
    await sleep(500);
  }
  return lpPricesCache;
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  getAmmTokensPrices,
  getAmmLpPrices
};
