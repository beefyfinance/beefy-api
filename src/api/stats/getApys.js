const { getAvaxApys } = require('./avax');
const { getMaticApys } = require('./matic');
const { getBSCApys } = require('./bsc');
const { getArbitrumApys } = require('./arbitrum');
const { getMetisApys } = require('./metis');
const { getOptimismApys } = require('./optimism');
const { getEthereumApys } = require('./ethereum');
const { getZksyncApys } = require('./zksync');
const { getBaseApys } = require('./base');
const { getGnosisApys } = require('./gnosis');
const { getLineaApys } = require('./linea');
const { getMantleApys } = require('./mantle');
const { getFraxtalApys } = require('./fraxtal');
const { getSeiApys } = require('./sei');
const { getRootstockApys } = require('./rootstock');
const { getScrollApys } = require('./scroll');
const { getLiskApys } = require('./lisk');
const { getSonicApys } = require('./sonic');
const { getBerachainApys } = require('./berachain');
const { getHyperevmApys } = require('./hyperevm');
const { getPlasmaApys } = require('./plasma');
const { getMonadApys } = require('./monad');
const { getMegaethApys } = require('./megaeth');
const { getRobinhoodApys } = require('./robinhood');
const { getKey, setKey } = require('../../utils/cache');
const { fetchBoostAprs, BOOST_APR_EXPIRED } = require('./getBoostAprs');
const { serviceEventBus } = require('../../utils/ServiceEventBus');
const { getLoggerFor } = require('../../utils/logger/index.js');

const logger = getLoggerFor({ module: 'apy' });

const INIT_DELAY = process.env.INIT_DELAY || 30 * 1000;
const BOOST_APR_INIT_DELAY = 5 * 1000;
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
  logger.info('updating apys');
  const start = Date.now();
  try {
    const results = await Promise.allSettled([
      getMaticApys(),
      getAvaxApys(),
      getBSCApys(),
      getArbitrumApys(),
      // getMetisApys(),
      getOptimismApys(),
      getEthereumApys(),
      getZksyncApys(),
      getBaseApys(),
      getGnosisApys(),
      getLineaApys(),
      // getMantleApys(),
      getFraxtalApys(),
      // getSeiApys(),
      getRootstockApys(),
      // getScrollApys(),
      // getLiskApys(),
      getSonicApys(),
      // getBerachainApys(),
      getHyperevmApys(),
      getPlasmaApys(),
      getMonadApys(),
      getMegaethApys(),
      getRobinhoodApys(),
    ]);

    for (const result of results) {
      if (result.status !== 'fulfilled') {
        logger.warn({ err: result.reason }, 'apy sub-calculation failed');
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

    logger.info({ durationMs: Date.now() - start }, 'updated apys');
    await saveToRedis();
  } catch (err) {
    logger.error({ err }, 'apy update failed');
  }

  setTimeout(updateApys, REFRESH_INTERVAL);
};

const updateBoostAprs = async () => {
  logger.info('updating boost aprs');
  const start = Date.now();
  try {
    const updatedBoostAprs = await fetchBoostAprs();
    boostAprs = {
      ...boostAprs,
      ...updatedBoostAprs,
    };
    //-1 will be returned when boost has ended and it will be removed from the api response
    Object.keys(boostAprs)
      .filter(boostId => boostAprs[boostId] === BOOST_APR_EXPIRED)
      .forEach(boostId => {
        delete boostAprs[boostId];
      });
    await saveBoostsToRedis();
    logger.info({ durationMs: Date.now() - start }, 'updated boost aprs');
  } catch (err) {
    logger.error({ err }, 'error updating boost aprs');
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
  await serviceEventBus.waitForFirstEvent('vaults/updated');
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
