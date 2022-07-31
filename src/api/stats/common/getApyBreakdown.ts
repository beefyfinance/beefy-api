import BigNumber from 'bignumber.js';

import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { compound } from '../../../utils/compound';

import { BASE_HPY, BEEFY_PERFORMANCE_FEE } from '../../../constants';

export interface ApyBreakdown {
  vaultApr?: number;
  compoundingsPerYear?: number;
  beefyPerformanceFee?: number;
  vaultApy?: number;
  lpFee?: number;
  tradingApr?: number;
  totalApy?: number;
}

export interface ApyBreakdownResult {
  apys: Record<string, number>;
  apyBreakdowns: Record<string, ApyBreakdown>;
}

export const getApyBreakdown = (
  pools: { name: string; address: string; beefyFee?: number }[],
  tradingAprs: Record<string, BigNumber>,
  farmAprs: BigNumber[],
  providerFee: number,
  performanceFee: number = BEEFY_PERFORMANCE_FEE
): ApyBreakdownResult => {
  let result: ApyBreakdownResult = {
    apys: {},
    apyBreakdowns: {},
  };
  result = getApyBreakdownWithFee(pools, tradingAprs, farmAprs, providerFee, performanceFee);
  return result;
};

export const getApyBreakdownWithFee = (
  pools: { name: string; address: string; beefyFee?: number }[],
  tradingAprs: Record<string, BigNumber>,
  farmAprs: BigNumber[],
  providerFee: number,
  performanceFee: number
): ApyBreakdownResult => {
  const result: ApyBreakdownResult = {
    apys: {},
    apyBreakdowns: {},
  };

  pools.forEach((pool, i) => {
    const simpleApr = farmAprs[i]?.toNumber();
    const fee = pool.beefyFee ? pool.beefyFee : BEEFY_PERFORMANCE_FEE;
    const SHARE_AFTER_PERFORMANCE_FEE = 1 - fee;
    const vaultApr = simpleApr * SHARE_AFTER_PERFORMANCE_FEE;
    const vaultApy = compound(simpleApr, BASE_HPY, 1, SHARE_AFTER_PERFORMANCE_FEE);
    const tradingApr: number | undefined = (
      (tradingAprs[pool.address.toLowerCase()] ?? new BigNumber(0)).isFinite()
        ? tradingAprs[pool.address.toLowerCase()]
        : new BigNumber(0)
    )?.toNumber();
    const totalApy = getFarmWithTradingFeesApy(
      simpleApr,
      tradingApr,
      BASE_HPY,
      1,
      SHARE_AFTER_PERFORMANCE_FEE
    );

    // Add token to APYs object
    result.apys[pool.name] = totalApy;
    result.apyBreakdowns[pool.name] = {
      vaultApr: vaultApr,
      compoundingsPerYear: BASE_HPY,
      beefyPerformanceFee: fee,
      vaultApy: vaultApy,
      lpFee: providerFee,
      tradingApr: tradingApr,
      totalApy: totalApy,
    };
  });

  return result;
};

export default getApyBreakdown;
