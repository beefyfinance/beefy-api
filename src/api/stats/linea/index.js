import { LINEA_CHAIN_ID } from '../../../constants.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { getBeefyCowLineaApys } from './getBeefyCowLineaApys.ts';
import { getLynexApys } from './getLynexApys.js';

const logger = getLoggerFor({ module: 'apy', chain: LINEA_CHAIN_ID });

const getApys = [getLynexApys, getBeefyCowLineaApys];

const getLineaApys = async () => {
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

export { getLineaApys };
