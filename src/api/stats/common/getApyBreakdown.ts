import BigNumber from 'bignumber.js';
import { BASE_HPY } from '../../../constants';
import {
  type ApyBreakdownResult,
  getApyBreakdownOnly as getApyBreakdownNew,
} from './getApyBreakdownNew';

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

  if (providerFee === undefined) {
    providerFee = 0;
  }

  pools.forEach((pool, i) => {
    const breakdown = getApyBreakdownNew({
      vaultId: pool.name,
      beefyFee: pool.beefyFee,
      compoundingsPerYear: BASE_HPY,
      providerFee: typeof providerFee === 'number' ? providerFee : providerFee[i],
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

export default getApyBreakdown;
