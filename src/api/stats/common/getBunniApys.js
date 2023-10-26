import { getApyBreakdown } from './getApyBreakdown';
import {
  getBoostedYearlyRewardsInUsd,
  getYearlyRewardsInUsd,
  getTotalStakedInUsd,
} from './curve/getCurveApyData';

export const getBunniApys = async params => {
  const [apys, tradingAprs] = await Promise.all([getPoolApys(params), getTradingApys(params)]);

  return getApyBreakdown(params.pools, 0, apys, 0);
};

const getPoolApys = async params => {
  const apys = [];

  for (let i = 0; i < params.pools.length; i++) {
    const boostedYearlyRewardsInUsd = await getBoostedYearlyRewardsInUsd(
      params.chainId,
      params.pools[i],
      'oLIT'
    );
    const yearRewardsInUsd = await getYearlyRewardsInUsd(params.chainId, params.pools[i]);

    const yearlyRewardsInUsd = boostedYearlyRewardsInUsd.plus(yearRewardsInUsd);
    const totalStakedInUsd = await getTotalStakedInUsd(params.chainId, params.pools[i]);

    if (params.log)
      console.log(
        params.pools[i].name,
        boostedYearlyRewardsInUsd.toString(),
        yearRewardsInUsd.toString(),
        totalStakedInUsd.toString()
      );

    apys.push(yearlyRewardsInUsd.dividedBy(totalStakedInUsd));
  }

  return apys;
};

const getTradingApys = async params => {
  const apys = [];

  // Have to write new code for pulling from the subgraph.
  return apys;
};

export default getBunniApys;
