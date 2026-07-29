import { ROBINHOOD_CHAIN_ID } from '../../../constants.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import type { ApyBreakdownResult } from '../common/getApyBreakdownNew.ts';
import { getBeefyCowRobinhoodApys } from './getBeefyCowRobinhoodApys.ts';
import { getUp33Apys } from './getUp33Apys.ts';

const logger = getLoggerFor({ module: 'apy', chain: ROBINHOOD_CHAIN_ID });

const getApys = [getBeefyCowRobinhoodApys, getUp33Apys];

const getRobinhoodApys = async () => {
  const start = Date.now();
  let apys: Record<string, unknown> = {};
  let apyBreakdowns: Record<string, unknown> = {};

  let promises: Promise<Partial<ApyBreakdownResult>>[] = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      logger.warn({ err: result.reason }, 'apy sub-calculation failed');
      continue;
    }

    let mappedApyValues: Record<string, unknown> | undefined = result.value;
    let mappedApyBreakdownValues: Record<string, unknown> | undefined = {};

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

export { getRobinhoodApys };
