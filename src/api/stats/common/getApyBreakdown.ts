'use strict';

import BigNumber from 'bignumber.js';

import getFarmWithTradingFeesApy from '../../../utils/getFarmWithTradingFeesApy';
import { compound } from '../../../utils/compound';

import { BASE_HPY } from '../../../constants';

const beefyPerformanceFee = 0.045;

interface ApyBreakdown {
  vaultApr?: number;
  compoundingsPerYear?: number;
  beefyPerformanceFee?: number;
  vaultApy?: number;
  lpFee?: number;
  tradingApr?: number;
  totalApy?: number;
}

export default function (
  pools: { name: string; address: string }[],
  tradingAprs: Record<string, BigNumber>,
  farmAprs: BigNumber[],
  providerFee: number,
  performanceFee: number = beefyPerformanceFee
) {
  const result: {
    apys: Record<string, number>;
    apyBreakdowns: Record<string, ApyBreakdown>;
  } = {
    apys: {},
    apyBreakdowns: {},
  };

  const shareAfterPerformanceFee = 1 - beefyPerformanceFee;

  pools.forEach((pool, i) => {
    const simpleApr = farmAprs[i]?.toNumber();
    const vaultApr = simpleApr * shareAfterPerformanceFee;
    const vaultApy = compound(simpleApr, BASE_HPY, 1, shareAfterPerformanceFee);
    const tradingApr = tradingAprs[pool.address.toLowerCase()]?.toNumber();
    const totalApy = getFarmWithTradingFeesApy(
      simpleApr,
      tradingApr,
      BASE_HPY,
      1,
      shareAfterPerformanceFee
    );

    // Add token to APYs object
    result.apys[pool.name] = totalApy;
    result.apyBreakdowns[pool.name] = {
      vaultApr: vaultApr,
      compoundingsPerYear: BASE_HPY,
      beefyPerformanceFee: performanceFee,
      vaultApy: vaultApy,
      lpFee: providerFee,
      tradingApr: tradingApr,
      totalApy: totalApy,
    };
  });

  return result;
}
