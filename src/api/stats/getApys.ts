import { getKey, setKey } from '../../utils/cache/index.ts';
import { envNumber } from '../../utils/env.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';
import { serviceEventBus } from '../../utils/ServiceEventBus.ts';
import { getArbitrumApys } from './arbitrum/index.ts';
import { getAvaxApys } from './avax/index.ts';
import { getBaseApys } from './base/index.ts';
import { getBSCApys } from './bsc/index.ts';
import { getEthereumApys } from './ethereum/index.ts';
import { getFraxtalApys } from './fraxtal/index.ts';
import { BOOST_APR_EXPIRED, fetchBoostAprs } from './getBoostAprs.ts';
import { getGnosisApys } from './gnosis/index.ts';
import { getHyperevmApys } from './hyperevm/index.ts';
import { getLineaApys } from './linea/index.ts';
import { getMaticApys } from './matic/index.ts';
import { getMegaethApys } from './megaeth/index.ts';
import { getMonadApys } from './monad/index.ts';
import { getOptimismApys } from './optimism/index.ts';
import { getPlasmaApys } from './plasma/index.ts';
import { getRobinhoodApys } from './robinhood/index.ts';
import { getRootstockApys } from './rootstock/index.ts';
import { getSonicApys } from './sonic/index.ts';
import { getZksyncApys } from './zksync/index.ts';

const logger = getLoggerFor({ module: 'apy' });

const INIT_DELAY = envNumber('INIT_DELAY', 30 * 1000);
const BOOST_APR_INIT_DELAY = 5 * 1000;
var REFRESH_INTERVAL = 15 * 60 * 1000;
const BOOST_REFRESH_INTERVAL = 2 * 60 * 1000;

let apys: Record<string, unknown> = {};
let apyBreakdowns: Record<string, unknown> = {};
let boostAprs: Record<string, number> = {};

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
      let mappedApyValues: Record<string, unknown> | undefined = result.value;
      let mappedApyBreakdownValues: Record<string, unknown> | undefined = {};

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
  let cachedApy = await getKey<Record<string, unknown>>('APY');
  let cachedApyBreakdown = await getKey<Record<string, unknown>>('APY_BREAKDOWN');
  let cachedBoostAprs = await getKey<Record<string, number>>('BOOST_APRS');
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

export { getApys, getBoostAprs, initApyService };
