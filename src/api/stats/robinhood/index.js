const { getBeefyCowRobinhoodApys } = require('./getBeefyCowRobinhoodApys');
const { getUp33Apys } = require('./getUp33Apys');
const { ROBINHOOD_CHAIN_ID } = require('../../../constants');
const { getLoggerFor } = require('../../../utils/logger/index.js');

const logger = getLoggerFor({ module: 'apy', chain: ROBINHOOD_CHAIN_ID });

const getApys = [getBeefyCowRobinhoodApys, getUp33Apys];

const getRobinhoodApys = async () => {
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

    let mappedApyValues = result.value;
    let mappedApyBreakdownValues = {};

    for (const [key, value] of Object.entries(result.value)) {
      mappedApyBreakdownValues[key] = {
        totalApy: value,
      };
    }

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

module.exports = { getRobinhoodApys };
