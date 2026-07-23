import { BigNumber } from 'bignumber.js';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { getApyBreakdown } from '../common/getApyBreakdown.ts';

const logger = getLoggerFor({ module: 'apy', platform: 'convex', chain: 'fraxtal' });

export const getConvexCvxFxsApys = async () => {
  let apy = new BigNumber(0);
  try {
    const apyData = await fetch('https://frax.convexfinance.com/api/frax/staked-cvxfxs').then(res => res.json());
    apyData?.rewards?.forEach(r => {
      const apr = (r?.apr || 0) / 100;
      apy = apy.plus(new BigNumber(apr));
    });
  } catch (e) {
    logger.warn({ err: e }, 'apy fetch failed');
  }
  return getApyBreakdown([{ name: 'convex-fraxtal-cvxfxs', address: '' }], {}, [apy], 0);
};
