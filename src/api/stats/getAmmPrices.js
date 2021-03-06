const { fetchAmmPoolsPrices } = require('../../utils/getPoolStats');

const cakeLpPools = require('../../data/cakeLpPools.json');
const cakePools = require('../../data/cakePools.json');

const pools = [
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
    let { poolPrices, tokenPrices } = await fetchAmmPoolsPrices(pools, knownPrices);
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
  getAmmLpPrices,
};
