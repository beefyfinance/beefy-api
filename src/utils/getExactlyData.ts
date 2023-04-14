import { getUtcSecondsFromDayRange } from './getUtcSecondsFromDayRange';
import { exactlyQuery } from '../apollo/queries';
import BigNumber from 'bignumber.js';
import { NormalizedCacheObject } from '@apollo/client/core';
import { ApolloClient } from '@apollo/client/core';

export const getExactlyData = async (
  client: ApolloClient<NormalizedCacheObject>,
  market: string
) => {
  const [start, end] = getUtcSecondsFromDayRange(1, 2);

  let supplyBase, utilization;

  try {
    const queryResponse0 = await client.query({
      query: exactlyQuery(market.toLowerCase(), start),
    });

    const queryResponse1 = await client.query({
      query: exactlyQuery(market.toLowerCase(), end),
    });

    const response0 = queryResponse0.data.marketUpdates;
    const response1 = queryResponse1.data.marketUpdates;

    const floatingAssets = new BigNumber(response1[0].floatingAssets);
    const floatingDebt = new BigNumber(response1[0].floatingDebt);

    const shareValue0 = new BigNumber(response0[0].floatingAssets).dividedBy(response0[0].floatingDepositShares);
    const shareValue1 = floatingAssets.dividedBy(response1[0].floatingDepositShares);
    const timestamp = new BigNumber(response1[0].timestamp).minus(response0[0].timestamp);

    supplyBase = shareValue1.minus(shareValue0).dividedBy(timestamp).times(31536000);
    utilization = floatingDebt.times('1e18').dividedBy(floatingAssets).integerValue();
  } catch (e) {
    console.error(e);
  }

  return { supplyBase, utilization };
};
