import type { BigNumber } from 'bignumber.js';
import { BASE_HPY } from '../../../constants.ts';
import { type ApyBreakdownResult, getApyBreakdownOnly as getApyBreakdownNew } from './getApyBreakdownNew.ts';

// back-compat export
export type { ApyBreakdownResult };

/**
 * @deprecated use getApyBreakdowns
 * @see getApyBreakdownNew.ts
 * */
export const getApyBreakdown = (
  pools: { name: string; address: string; beefyFee?: number }[],
  tradingAprs?: Record<string, BigNumber> | undefined,
  farmAprs?: BigNumber[] | undefined,
  providerFee?: number | BigNumber[] | undefined,
  liquidStakingAprs?: number[] | undefined,
  composablePoolAprs?: number[] | undefined,
  clmAprs?: number[] | undefined,
  merklAprs?: number[] | undefined
): ApyBreakdownResult => {
  const result: ApyBreakdownResult = {
    apys: {},
    apyBreakdowns: {},
  };

  const providerFees = providerFee === undefined ? 0 : providerFee;

  pools.forEach((pool, i) => {
    const breakdown = getApyBreakdownNew({
      vaultId: pool.name,
      beefyFee: pool.beefyFee,
      compoundingsPerYear: BASE_HPY,
      providerFee: typeof providerFees === 'number' ? providerFees : providerFees[i],
      trading: tradingAprs?.[pool.address.toLowerCase()],
      vault: farmAprs?.[i],
      liquidStaking: liquidStakingAprs?.[i],
      composablePool: composablePoolAprs?.[i],
      clm: clmAprs?.[i],
      merkl: merklAprs?.[i],
    });

    // Add token to APYs object
    result.apys[pool.name] = breakdown.totalApy;
    result.apyBreakdowns[pool.name] = breakdown;
  });

  return result;
};
