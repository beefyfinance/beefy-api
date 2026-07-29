import { ETH_CHAIN_ID } from '../../../constants.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import type { ApyBreakdownResult } from '../common/getApyBreakdownNew.ts';
import { getMorphoApys } from '../common/morpho/getMorphoApys.ts';
import { getPendleApys } from '../common/pendle/getPendleApys.ts';
import { getPendleUnboostedApys } from '../common/pendle/getPendleUnboostedApys.ts';
import { getAaveV4Apys } from './getAaveV4Apys.ts';
import { getAuraApys } from './getAuraApys.ts';
import { getBeefyCowEthereumApys } from './getBeefyCowEthereumApys.ts';
import { getBifiMaxiApy } from './getBifiMaxiApy.ts';
import { getbeQIApy } from './getbeQIApy.ts';
import { getConvexApys } from './getConvexApys.ts';
import { getConvexCrvApy } from './getConvexCrvApy.ts';
import { getConvexCvxApy } from './getConvexCvxApy.ts';
import { getConvexCvxTokensApy } from './getConvexCvxTokensApy.ts';
import { getCurveApys } from './getCurveApys.ts';
import { getFxApys } from './getFxApys.ts';
import { getSkyApy } from './getSkyApy.ts';
import { getStakeDaoApys } from './getStakeDaoApys.ts';
import { getYieldBasisApys } from './getYieldBasisApys.ts';
import morphoPoolsData from '../../../data/ethereum/morphoPools.json' with { type: 'json' };
import pendlePoolsData from '../../../data/ethereum/pendlePools.json' with { type: 'json' };
import pendleUnboostedPoolsData from '../../../data/ethereum/pendleUnboostedPools.json' with { type: 'json' };

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
  getYieldBasisApys,
  getSkyApy,
  getAaveV4Apys,
  getBeefyCowEthereumApys,
];

const getEthereumApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let promises: Promise<Partial<ApyBreakdownResult>>[] = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      logger.warn({ err: result.reason }, 'apy sub-calculation failed');
      continue;
    }

    // Set default APY values
    let mappedApyValues: object | undefined = result.value;
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

  const end = Date.now();
  logger.info({ durationMs: end - start }, 'apy updated');

  return {
    apys,
    apyBreakdowns,
  };
};

export { getEthereumApys };
