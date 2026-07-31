import { BigNumber } from 'bignumber.js';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { getApyBreakdown } from '../common/getApyBreakdown.ts';

const logger = getLoggerFor({ module: 'apy', component: 'convex', chain: 'fraxtal' });

type ConvexStakedCvxFxsReward = {
  apr?: number;
};

type ConvexStakedCvxFxsResponse = {
  rewards?: ConvexStakedCvxFxsReward[];
};

export const getConvexCvxFxsApys = async () => {
  let apy = new BigNumber(0);
  try {
    // FIXME(unsafe-cast): unchecked response shape
    const apyData = (await fetch('https://frax.convexfinance.com/api/frax/staked-cvxfxs').then(res =>
      res.json()
    )) as ConvexStakedCvxFxsResponse;
    apyData?.rewards?.forEach(r => {
      const apr = (r?.apr || 0) / 100;
      apy = apy.plus(apr);
    });
  } catch (e) {
    logger.warn({ err: e }, 'apy fetch failed');
  }
  return getApyBreakdown([{ name: 'convex-fraxtal-cvxfxs', address: '' }], {}, [apy], 0);
};
