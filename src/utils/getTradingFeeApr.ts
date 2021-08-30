import { getUtcSecondsFromDayRange } from './getUtcSecondsFromDayRange';
import { pairDayDataQuery, pairDayDataSushiQuery } from '../apollo/queries';
import BigNumber from 'bignumber.js';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';

interface PairDayData {
  id: string;
  dailyVolumeUSD: number;
  volumeUSD: number;
  reserveUSD: number;
}

export const getTradingFeeApr = async (
  client: ApolloClient<NormalizedCacheObject>,
  pairAddresses: string[],
  liquidityProviderFee: number
) => {
  const [start, end] = getUtcSecondsFromDayRange(1, 2);
  const pairAddressToAprMap: Record<string, BigNumber> = {};

  try {
    let {
      data: { pairDayDatas },
    }: { data: { pairDayDatas: PairDayData[] } } = await client.query({
      query: pairDayDataQuery(addressesToLowercase(pairAddresses), start, end),
    });

    for (const pairDayData of pairDayDatas) {
      const pairAddress = pairDayData.id.split('-')[0].toLowerCase();
      pairAddressToAprMap[pairAddress] = new BigNumber(pairDayData.dailyVolumeUSD)
        .times(liquidityProviderFee)
        .times(365)
        .dividedBy(pairDayData.reserveUSD);
    }
  } catch (e) {
    console.error(e);
  }

  return pairAddressToAprMap;
};

export const getTradingFeeAprJoe = async (
  client: ApolloClient<NormalizedCacheObject>,
  pairAddresses: string[],
  liquidityProviderFee: number
) => {
  const [start0, end0] = getUtcSecondsFromDayRange(1, 2);
  const [start1, end1] = getUtcSecondsFromDayRange(3, 4);
  const pairAddressToAprMap: Record<string, BigNumber> = {};

  try {
    let queryResponse0 = await client.query({
      query: pairDayDataSushiQuery(addressesToLowercase(pairAddresses), start0, end0),
    });

    let queryResponse1 = await client.query({
      query: pairDayDataSushiQuery(addressesToLowercase(pairAddresses), start1, end1),
    });

    const pairDayDatas0 = queryResponse0.data.pairs.map(pair => pair.dayData[0]);
    const pairDayDatas1 = queryResponse1.data.pairs.map(pair => pair.dayData[0]);

    for (const pairDayData of zip([pairDayDatas0, pairDayDatas1])) {
      if (pairDayData && pairDayData[0] && pairDayData[1]) {
        const pairAddress = pairDayData[0].id.split('-')[0].toLowerCase();
        const avgVol = new BigNumber(pairDayData[0].volumeUSD)
          .plus(pairDayData[1].volumeUSD)
          .dividedBy(2);
        const avgReserve = new BigNumber(pairDayData[0].reserveUSD)
          .plus(pairDayData[1].reserveUSD)
          .dividedBy(2);
        pairAddressToAprMap[pairAddress] = new BigNumber(avgVol)
          .times(liquidityProviderFee)
          .times(365)
          .dividedBy(avgReserve);
      }
    }
  } catch (e) {
    console.error(e);
  }

  return pairAddressToAprMap;
};

export const getTradingFeeAprSushi = async (
  client: ApolloClient<NormalizedCacheObject>,
  pairAddresses: string[],
  liquidityProviderFee: number
) => {
  const [start0, end0] = getUtcSecondsFromDayRange(8, 9);
  const [start1, end1] = getUtcSecondsFromDayRange(11, 12);
  const pairAddressToAprMap: Record<string, BigNumber> = {};

  try {
    let queryResponse0 = await client.query({
      query: pairDayDataSushiQuery(addressesToLowercase(pairAddresses), start0, end0),
    });

    let queryResponse1 = await client.query({
      query: pairDayDataSushiQuery(addressesToLowercase(pairAddresses), start1, end1),
    });

    const pairDayDatas0 = queryResponse0.data.pairs.map(pair => pair.dayData[0]);
    const pairDayDatas1 = queryResponse1.data.pairs.map(pair => pair.dayData[0]);

    for (const pairDayData of zip([pairDayDatas0, pairDayDatas1])) {
      if (pairDayData && pairDayData[0] && pairDayData[1]) {
        const pairAddress = pairDayData[0].id.split('-')[0].toLowerCase();
        const avgVol = new BigNumber(pairDayData[0].volumeUSD)
          .plus(pairDayData[1].volumeUSD)
          .dividedBy(2);
        const avgReserve = new BigNumber(pairDayData[0].reserveUSD)
          .plus(pairDayData[1].reserveUSD)
          .dividedBy(2);
        pairAddressToAprMap[pairAddress] = new BigNumber(avgVol)
          .times(liquidityProviderFee)
          .times(365)
          .dividedBy(avgReserve);
      }
    }
  } catch (e) {
    console.error(e);
  }

  return pairAddressToAprMap;
};

const addressesToLowercase = (pairAddresses: string[]) =>
  pairAddresses.map(address => address.toLowerCase());

const zip = arrays => {
  return arrays[0].map((_, i) => {
    return arrays.map(array => {
      return array[i];
    });
  });
};
