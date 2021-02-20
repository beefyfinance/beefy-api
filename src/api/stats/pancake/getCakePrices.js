const { BSC_CHAIN_ID } = require('../../../../constants');
const { fetchPoolTokensPrices } = require('../../../utils/getPoolStats');

const bakeryPools = require('../../../data/bakeryLpPools.json');
const cakePools = require('../../../data/cakeLpPools.json');
const jetfuelPools = require('../../../data/jetfuelLpPools.json');
const kebabPools = require('../../../data/kebabLpPools.json');
const bdollarBdoPools = require('../../../data/bdollarBdoLpPools.json');
const bdollarSbdoPools = require('../../../data/kebabLpPools.json');
const boltBtdPools = require('../../../data/boltBtdLpPools.json');
const boltBtsPools = require('../../../data/boltBtsLpPools.json');
const helmetPools = require('../../../data/helmetLpPools.json');
const mdexPools = require('../../../data/mdexLpPools.json');
const monsterPools = require('../../../data/monsterLpPools.json');
const nyacashPools = require('../../../data/nyacashLpPools.json');
const nyanswopPools = require('../../../data/nyanswopLpPools.json');
const thugsPools = require('../../../data/thugsLpPools.json');
const spongePools = require('../../../data/spongeLpPools.json');

const pools = [
  ...bakeryPools,
  ...cakePools,
  ...jetfuelPools,
  ...kebabPools,
  ...bdollarBdoPools,
  ...bdollarSbdoPools,
  ...boltBtdPools,
  ...boltBtsPools,
  ...helmetPools,
  ...mdexPools,
  ...monsterPools,
  ...nyacashPools,
  ...nyanswopPools,
  ...thugsPools,
  ...spongePools,
];

const oracle = 'pancake';

const knownPrices = {
  BUSD: 1,
  USDT: 1,
  HUSD: 1,
  DAI: 1,
  USDC: 1,
};

const refreshInterval = 10 * 60 * 1000;
let priceCache = {};
let isProcessing = false;

const fetchCakeTokensPrices = async () => {
  isProcessing = true;
  try {
    priceCache = await fetchPoolTokensPrices(oracle, pools, knownPrices, BSC_CHAIN_ID);
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

const getCakeTokensPrices = async () => {
  while (isProcessing) {
    await sleep(500);
  }
  return priceCache;
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { getCakeTokensPrices };
