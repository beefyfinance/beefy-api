import type { TypedDocumentNode } from '@apollo/client/core/types.js';
import { gql } from 'graphql-tag';

export type HopResult = { tokenSwaps: { tokensSold: string }[] };

export type JoeDayDataResult = { dayDatas: { usdRemitted: string }[] };

export type ProtocolDayDataResult = { uniswapDayDatas: { dailyVolumeUSD: string }[] };

export type GmxMarketFees = { marketAddress: string; timestampGroup: string; cumulativeFeeUsdPerPoolValue: string };
export type GmxFeesResult = { collectedMarketFeesInfos: GmxMarketFees[] };

export type BaseSwapResult = {
  liquidityPoolDailySnapshots: { id: string; dailyVolumeUSD: string; totalValueLockedUSD: string }[];
};

export const dayDataQuery = (timestamp: number) => {
  const dayId = Math.floor(timestamp / 86400000) - 1;
  const queryString = `
    query days {
      uniswapDayData(id: "${dayId}") {
        dailyVolumeUSD
      }
    }
`;
  return gql(queryString);
};

export const joeDayDataQuery = (timestamp: number) => {
  const dayId = Math.floor(timestamp / 86400000) - 1;
  const queryString = `
    query days {
      dayData(id: "${dayId}") {
        volumeUSD
      }
    }
`;
  return gql(queryString);
};

export const joeDayDataRangeQuery = (
  startTimestamp: number,
  endTimestamp: number
): TypedDocumentNode<JoeDayDataResult> => {
  const queryString = `
  query volumeUSD {
    dayDatas(where: { date_gt: ${startTimestamp}, date_lt: ${endTimestamp} }) {
      usdRemitted
    }
  }
`;
  return gql(queryString);
};

export const protocolDayDataRangeQuery = (
  startTimestamp: number,
  endTimestamp: number
): TypedDocumentNode<ProtocolDayDataResult> => {
  const queryString = `
  query volume {
    uniswapDayDatas(where: { date_gt: ${startTimestamp}, date_lt: ${endTimestamp} }) {
      dailyVolumeUSD
    }
  }
`;
  return gql(queryString);
};

export const uniswapPositionQuery = (strategy: string, block: number) => {
  const queryString = `
    query positionData {
      positions(where: {owner: "${strategy}", _change_block: {number_gte: ${block}}}) {
        id
        collectedFeesToken0
        collectedFeesToken1
      }
    }
`;
  return gql(queryString);
};

export const hopQuery = (
  address: string,
  startTimestamp: number,
  endTimestamp: number
): TypedDocumentNode<HopResult> => {
  const queryString = `
  query hop {
    tokenSwaps(first: 1000, orderBy: tokensSold, orderDirection: desc, where: { tokenEntity_: { address:"${address}" } , timestamp_gt: ${startTimestamp}, timestamp_lt: ${endTimestamp} }) {
      tokensSold
    }
  }
`;
  return gql(queryString);
};

export const gmxQuery = (markets: string[], timestamp: number): TypedDocumentNode<GmxFeesResult> => {
  let marketsString = `[`;
  markets.map(market => {
    return (marketsString += `"${market}"`);
  });
  marketsString += ']';
  const queryString = `
    query gmx {
      collectedMarketFeesInfos(first: 1000, orderBy: timestampGroup, orderDirection: desc, where: { marketAddress_in: ${marketsString}, timestampGroup_lte: ${timestamp}}) {
        marketAddress
        cumulativeFeeUsdPerPoolValue
        timestampGroup
      }
    }
  `;
  return gql(queryString);
};

export const baseSwapQuery = (
  pairs: string[],
  startTimestamp: number,
  endTimestamp: number
): TypedDocumentNode<BaseSwapResult> => {
  let pairsString = `[`;
  pairs.map(pair => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  const queryString = `
    query baseSwapDatas {
      liquidityPoolDailySnapshots(orderBy: timestamp, orderDirection: desc, where: { pool_in: ${pairsString}, timestamp_gt: ${startTimestamp}, timestamp_lt: ${endTimestamp} }) {
        id
    		dailyVolumeUSD
        totalValueLockedUSD
      }
    }
  `;
  return gql(queryString);
};
