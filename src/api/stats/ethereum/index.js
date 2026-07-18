import { getAuraApys } from './getAuraApys.js';
import { getConvexApys } from './getConvexApys.js';
import { getConvexCrvApy } from './getConvexCrvApy.js';
import { getBifiMaxiApy } from './getBifiMaxiApy.js';
import { getConvexCvxTokensApy } from './getConvexCvxTokensApy.js';
import { getCurveApys } from './getCurveApys.js';
import { getStakeDaoApys } from './getStakeDaoApys.js';
import { getConvexCvxApy } from './getConvexCvxApy.js';
import { getbeQIApy } from './getbeQIApy.js';
import { getFxApys } from './getFxApys.js';
import { getSkyApy } from './getSkyApy.js';
import { getMorphoApys } from '../common/morpho/getMorphoApys.js';
import { ETH_CHAIN_ID } from '../../../constants.ts';
import { getPendleApys } from '../common/pendle/getPendleApys.js';
import { getPendleUnboostedApys } from '../common/pendle/getPendleUnboostedApys.js';
import { getBeefyCowEthereumApys } from './getBeefyCowEthereumApys.ts';
import { getAaveV4Apys } from './getAaveV4Apys.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import pendlePoolsData from '../../../data/ethereum/pendlePools.json' with { type: "json" };
import pendleUnboostedPoolsData from '../../../data/ethereum/pendleUnboostedPools.json' with { type: "json" };
import morphoPoolsData from '../../../data/ethereum/morphoPools.json' with { type: "json" };

const logger = getLoggerFor({ module: 'apy', chain: ETH_CHAIN_ID });

const getApys = [
  getAuraApys,
  getbeQIApy,
  getCurveApys,
  getConvexApys,
  getStakeDaoApys,
  getConvexCrvApy,
  getConvexCvxApy,
  getConvexCvxTokensApy,
  getFxApys,
  getBifiMaxiApy,
  () => getPendleApys(pendlePoolsData),
  () => getPendleUnboostedApys(pendleUnboostedPoolsData),
  () => getMorphoApys(ETH_CHAIN_ID, morphoPoolsData),
  getSkyApy,
  getAaveV4Apys,
  getBeefyCowEthereumApys,
];

const getEthereumApys = async () => {
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

export { getEthereumApys };
