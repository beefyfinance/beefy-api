import { LISK_CHAIN_ID as chainId } from '../../../constants.ts';
import { getEDecimals } from '../../../utils/getEDecimals.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

const logger = getLoggerFor({ module: 'apy', platform: 'velodrome', chain: chainId });

import { addressBook } from '../../../../packages/address-book/src/address-book/index.ts';
import volatilePools from '../../../data/lisk/velodromeLiskPools.json' with { type: 'json' };
import stablePools from '../../../data/lisk/velodromeLiskStablePools.json' with { type: 'json' };

const {
  lisk: {
    tokens: { XVELO },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getVelodromeLiskApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'XVELO',
    oracle: 'tokens',
    decimals: getEDecimals(XVELO.decimals),
    reward: XVELO.address,
    boosted: false,
    singleReward: true,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys]);
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

export default getVelodromeLiskApys;
