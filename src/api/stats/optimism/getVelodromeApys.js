import { OPTIMISM_CHAIN_ID as chainId }from '../../../constants.ts';
import { getEDecimals } from '../../../utils/getEDecimals.ts';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

import oldStablePools from '../../../data/optimism/oldVelodromeStableLpPools.json' with { type: "json" };
import oldVolatilePools from '../../../data/optimism/oldVelodromeLpPools.json' with { type: "json" };
import stablePools from '../../../data/optimism/velodromeStableLpPools.json' with { type: "json" };
import volatilePools from '../../../data/optimism/velodromeLpPools.json' with { type: "json" };
import { addressBook } from '../../../../packages/address-book/src/address-book/index.ts';

const {
  optimism: {
    tokens: { VELO, VELOV2 },
  },
} = addressBook;

import { getLoggerFor } from '../../../utils/logger/index.ts';
const logger = getLoggerFor({ module: 'apy', platform: 'velodrome', chain: chainId });

const pools = [...stablePools, ...volatilePools];
const oldPools = [...oldStablePools, ...oldVolatilePools];
const getVelodromeApys = async () => {
  const oldGaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: oldPools,
    oracleId: 'VELO',
    oracle: 'tokens',
    decimals: getEDecimals(VELO.decimals),
    reward: VELO.address,
    boosted: false,
    // log: true,
  });

  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'VELOV2',
    oracle: 'tokens',
    decimals: getEDecimals(VELOV2.decimals),
    reward: VELOV2.address,
    boosted: false,
    singleReward: true,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([oldGaugeApys, gaugeApys]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      logger.warn({ err: result.reason }, 'apy sub-calculation failed');
    } else {
      apys = { ...apys, ...result.value.apys };
      apyBreakdowns = { ...apyBreakdowns, ...result.value.apyBreakdowns };
    }
  }

  return {
    apys,
    apyBreakdowns,
  };
};

export default getVelodromeApys;
