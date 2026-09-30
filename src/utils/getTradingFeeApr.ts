import type { NormalizedCacheObject } from '@apollo/client/cache/inmemory/types.js';
import type { ApolloClient } from '@apollo/client/core/ApolloClient.js';
import { BigNumber } from 'bignumber.js';
import {
  baseSwapQuery,
  dayDataQuery,
  gmxQuery,
  hopQuery,
  joeDayDataQuery,
  joeDayDataRangeQuery,
  protocolDayDataRangeQuery,
} from '../apollo/queries.ts';
import { getUtcSecondsFromDayRange } from './getUtcSecondsFromDayRange.ts';

export const getTradingFeeAprHop = async (
  client: ApolloClient<NormalizedCacheObject>,
  pairAddresses: string[],
  tokens: string[],
  tvl: number[],
  liquidityProviderFee: number
) => {
  const [start, end] = getUtcSecondsFromDayRange(1, 2);
  const pairAddressToAprMap: Record<string, BigNumber> = {};

  try {
    let i = 0;
    // TODO: client requests could be done concurrently
    for (const token of tokens) {
      const {
        data: { tokenSwaps },
      } = await client.query({
        query: hopQuery(token, start, end),
      });
      const values = tokenSwaps.map(({ tokensSold }) => tokensSold);
      const sum = BigNumber.sum.apply(null, values);
      pairAddressToAprMap[pairAddresses[i]] = sum.times(liquidityProviderFee).times(365).dividedBy(tvl[i]);
      ++i;
    }
  } catch (e) {
    // console.error('> getTradingFeeAprHop error', pairAddresses[0]);
  }

  return pairAddressToAprMap;
};

const addressesToLowercase = (pairAddresses: string[]) => pairAddresses.map(address => address.toLowerCase());

export const getYearlyPlatformTradingFees = async (
  client: ApolloClient<NormalizedCacheObject>,
  liquidityProviderFee: number
) => {
  let yearlyTradingFeesUsd = new BigNumber(0);
  const timestamp = Date.now();

  try {
    let data = await client.query({ query: dayDataQuery(timestamp) });

    const dailyVolumeUSD = new BigNumber(data.data.uniswapDayData.dailyVolumeUSD);

    yearlyTradingFeesUsd = dailyVolumeUSD.times(liquidityProviderFee).times(365);
  } catch (e) {
    // console.error('> getYearlyPlatformTradingFees error');
  }

  return yearlyTradingFeesUsd;
};

export const getYearlyJoePlatformTradingFees = async (
  client: ApolloClient<NormalizedCacheObject>,
  liquidityProviderFee: number
) => {
  let yearlyTradingFeesUsd = new BigNumber(0);
  const timestamp = Date.now();

  try {
    let data = await client.query({ query: joeDayDataQuery(timestamp) });

    const dailyVolumeUSD = new BigNumber(data.data.dayData.volumeUSD);

    yearlyTradingFeesUsd = dailyVolumeUSD.times(liquidityProviderFee).times(365);
  } catch (e) {
    // console.error('> getYearlyJoePlatformTradingFees error');
  }

  return yearlyTradingFeesUsd;
};

export const getYearlyRemittedUsdForSJOE = async (
  client: ApolloClient<NormalizedCacheObject>,
  numDays: number = 7,
  startDaysAgo: number = 1
) => {
  let yearlyRemittedUsd = new BigNumber(0);
  const [startTimestamp, endTimestamp] = getUtcSecondsFromDayRange(startDaysAgo, startDaysAgo + numDays);

  try {
    const result = await client.query({
      query: joeDayDataRangeQuery(startTimestamp, endTimestamp),
    });
    const dayData = result.data.dayDatas.map(day => new BigNumber(day.usdRemitted));
    const totalVolume = BigNumber.sum(...dayData);
    yearlyRemittedUsd = totalVolume.dividedBy(numDays).times(365);
  } catch (e) {
    // console.error('> getYearlyRemittedUsdForSJOE error');
  }

  return yearlyRemittedUsd;
};

export const getYearlyTradingFeesForProtocols = async (
  client: ApolloClient<NormalizedCacheObject>,
  liquidityProviderFee: number
) => {
  let yearlyTradingFeesUsd = new BigNumber(0);
  const [start0, end0] = getUtcSecondsFromDayRange(1, 8);

  try {
    const data = await client.query({
      query: protocolDayDataRangeQuery(start0, end0),
    });

    const dayData = data.data.uniswapDayDatas.map(data => new BigNumber(data.dailyVolumeUSD));

    const totalVolume = BigNumber.sum.apply(null, dayData);
    const avgVolume = totalVolume.dividedBy(7);
    const dailyTradingApr = avgVolume.times(liquidityProviderFee);
    yearlyTradingFeesUsd = dailyTradingApr.times(365);
  } catch (e) {
    // console.error('> getYearlyTradingFeesForProtocols error');
  }

  return yearlyTradingFeesUsd;
};

export const getGmxTradingFeeApr = async (client: ApolloClient<NormalizedCacheObject>, marketAddresses: string[]) => {
  const [start, end] = getUtcSecondsFromDayRange(0, 1);
  const marketAddressToAprMap: Record<string, BigNumber> = {};

  try {
    const currentData = await client.query({
      query: gmxQuery(addressesToLowercase(marketAddresses), end),
    });
    const pastData = await client.query({
      query: gmxQuery(addressesToLowercase(marketAddresses), start),
    });
    const currentFees = currentData.data.collectedMarketFeesInfos;
    const pastFees = pastData.data.collectedMarketFeesInfos;

    for (let market of marketAddresses) {
      market = market.toLowerCase();
      const currentMarket = currentFees.find(m => m.marketAddress === market);
      const pastMarket = pastFees.find(m => m.marketAddress === market);
      if (!currentMarket || !pastMarket) {
        throw new Error(`missing gmx market fees for ${market}`);
      }

      const elapsed = new BigNumber(currentMarket.timestampGroup).minus(pastMarket.timestampGroup);
      marketAddressToAprMap[market] = new BigNumber(currentMarket.cumulativeFeeUsdPerPoolValue)
        .minus(pastMarket.cumulativeFeeUsdPerPoolValue)
        .dividedBy(elapsed)
        .times(31536000)
        .dividedBy('1e30');
    }
  } catch (e) {
    //console.error('> getGmxTradingFeeApr error', marketAddresses[0]);
  }

  return marketAddressToAprMap;
};

export const getBaseSwapTradingFeeApr = async (
  client: ApolloClient<NormalizedCacheObject>,
  pairAddresses: string[],
  liquidityProviderFee: number
) => {
  const [start, end] = getUtcSecondsFromDayRange(1, 2);
  const pairAddressToAprMap: Record<string, BigNumber> = {};

  try {
    const {
      data: { liquidityPoolDailySnapshots },
    } = await client.query({
      query: baseSwapQuery(addressesToLowercase(pairAddresses), start, end),
    });

    for (const baseSwapData of liquidityPoolDailySnapshots) {
      const pairAddress = baseSwapData.id.split('-')[0].toLowerCase();
      pairAddressToAprMap[pairAddress] = new BigNumber(baseSwapData.dailyVolumeUSD)
        .times(liquidityProviderFee)
        .times(365)
        .dividedBy(baseSwapData.totalValueLockedUSD);
    }
  } catch (e) {
    //console.error('> getBaseSwapTradingFeeApr error', pairAddresses[0]);
  }

  return pairAddressToAprMap;
};
