const { getBeefyCowBerachainApys } = require('./getBeefyCowBerachainApys');
const getBeraswapApys = require('./getBeraswapApys');
const { getKodiakApys } = require('./getKodiakApys');
const { BERACHAIN_CHAIN_ID } = require('../../../constants');
const { getLoggerFor } = require('../../../utils/logger/index.js');

const logger = getLoggerFor({ module: 'apy', chain: BERACHAIN_CHAIN_ID });

const getApys = [getBeefyCowBerachainApys, getBeraswapApys, getKodiakApys];

const getBerachainApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

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

  const end = Date.now();
  logger.info({ durationMs: end - start }, 'apy updated');

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getBerachainApys };
