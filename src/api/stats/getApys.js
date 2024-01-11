const { getAvaxApys } = require('./avax');
const { getMaticApys } = require('./matic');
const { getFantomApys } = require('./fantom');
const { getBSCApys } = require('./bsc');
const { getArbitrumApys } = require('./arbitrum');
const { getCeloApys } = require('./celo');
const { getMoonriverApys } = require('./moonriver');
const { getCronosApys } = require('./cronos');
const { getAuroraApys } = require('./aurora');
const { getFuseApys } = require('./fuse');
const { getMetisApys } = require('./metis');
const { getMoonbeamApys } = require('./moonbeam');
const { getEmeraldApys } = require('./emerald');
const { getOptimismApys } = require('./optimism');
const { getKavaApys } = require('./kava');
const { getCantoApys } = require('./canto');
const { getEthereumApys } = require('./ethereum');
const { getZksyncApys } = require('./zksync');
const { getZkevmApys } = require('./zkevm');
const { getBaseApys } = require('./base');
const { getGnosisApys } = require('./gnosis');
const { getLineaApys } = require('./linea');
const { getMantleApys } = require('./mantle');
const { getKey, setKey } = require('../../utils/cache');
const { fetchBoostAprs } = require('./getBoostAprs');

const INIT_DELAY = process.env.INIT_DELAY || 30 * 1000;
const BOOST_APR_INIT_DELAY = 30 * 1000;
var REFRESH_INTERVAL = 15 * 60 * 1000;
const BOOST_REFRESH_INTERVAL = 2 * 60 * 1000;

let apys = {};
let apyBreakdowns = {};
let boostAprs = {};

const getApys = () => {
  return {
    apys,
    apyBreakdowns,
  };
};

const getBoostAprs = () => boostAprs;

const updateApys = async () => {
  console.log('> updating apys');
  const start = Date.now();
  try {
    const results = await Promise.allSettled([
      getMaticApys(),
      getAvaxApys(),
      getFantomApys(),
      getBSCApys(),
      getArbitrumApys(),
      getCeloApys(),
      getMoonriverApys(),
      getCronosApys(),
      getAuroraApys(),
      getFuseApys(),
      getMetisApys(),
      getMoonbeamApys(),
      // getEmeraldApys(),
      getOptimismApys(),
      getKavaApys(),
      getEthereumApys(),
      getCantoApys(),
      getZksyncApys(),
      getZkevmApys(),
      getBaseApys(),
      getGnosisApys(),
      getLineaApys(),
      getMantleApys(),
    ]);

    for (const result of results) {
      if (result.status !== 'fulfilled') {
        console.warn('getApys error', result.reason);
        continue;
      }

      // Set default APY values
      let mappedApyValues = result.value;
      let mappedApyBreakdownValues = {};

      // Loop through key values and move default breakdown format
      // To require totalApy key
      for (const [key, value] of Object.entries(result.value)) {
        mappedApyBreakdownValues[key] = {
          totalApy: value,
        };
      }

      // Break out to apy and breakdowns if possible
      let hasApyBreakdowns = 'apyBreakdowns' in result.value;
      if (hasApyBreakdowns) {
        mappedApyValues = result.value.apys;
        mappedApyBreakdownValues = result.value.apyBreakdowns;
      }

      apys = { ...apys, ...mappedApyValues };

      apyBreakdowns = { ...apyBreakdowns, ...mappedApyBreakdownValues };
    }

    console.log(`> updated apys (${(Date.now() - start) / 1000}s)`);
    await saveToRedis();
  } catch (err) {
    console.error('> apy initialization failed', err);
  }

  setTimeout(updateApys, REFRESH_INTERVAL);
};

const updateBoostAprs = async () => {
  console.log('> updating boost aprs');
  const start = Date.now();
  try {
    const updatedBoostAprs = await fetchBoostAprs();
    boostAprs = {
      ...boostAprs,
      ...updatedBoostAprs,
    };
    //-1 will be returned when boost has ended and it will be removed from the api response
    Object.keys(boostAprs)
      .filter(boostId => boostAprs[boostId] === -1)
      .forEach(boostId => {
        delete boostAprs[boostId];
      });
    await saveBoostsToRedis();
    console.log(`> updated boost aprs (${(Date.now() - start) / 1000}s)`);
  } catch (err) {
    console.error(`> error updating boost aprs: ${err.message}`);
  }

  setTimeout(updateBoostAprs, BOOST_REFRESH_INTERVAL);
};

const initApyService = async () => {
  let cachedApy = await getKey('APY');
  let cachedApyBreakdown = await getKey('APY_BREAKDOWN');
  let cachedBoostAprs = await getKey('BOOST_APRS');
  apys = cachedApy ?? {};
  apyBreakdowns = cachedApyBreakdown ?? {};
  boostAprs = cachedBoostAprs ?? {};

  setTimeout(updateApys, INIT_DELAY);
  setTimeout(updateBoostAprs, BOOST_APR_INIT_DELAY);
};

const saveToRedis = async () => {
  await setKey('APY', apys);
  await setKey('APY_BREAKDOWN', apyBreakdowns);
};

const saveBoostsToRedis = async () => {
  await setKey('BOOST_APRS', boostAprs);
};

module.exports = { getApys, getBoostAprs, initApyService };
