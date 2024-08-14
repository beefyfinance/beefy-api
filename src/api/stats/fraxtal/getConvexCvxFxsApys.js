import BigNumber from 'bignumber.js';
import getApyBreakdown from '../common/getApyBreakdown';

export const getConvexCvxFxsApys = async () => {
  let apy = new BigNumber(0);
  try {
    const apyData = await fetch('https://frax.convexfinance.com/api/frax/staked-cvxfxs').then(res =>
      res.json()
    );
    apyData?.rewards?.forEach(r => {
      const apr = (r?.apr || 0) / 100;
      apy = apy.plus(new BigNumber(apr));
    });
  } catch (e) {
    console.error('Convex fraxtal cvxFXS apy failed', e.message);
  }
  return getApyBreakdown([{ name: 'convex-fraxtal-cvxfxs', address: '' }], {}, [apy], 0);
};
