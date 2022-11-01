import BigNumber from 'bignumber.js';

import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { compound } from '../../../utils/compound';

import { BASE_HPY } from '../../../constants';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';

export interface ApyBreakdown {
  vaultApr?: number;
  compoundingsPerYear?: number;
  beefyPerformanceFee?: number;
  vaultApy?: number;
  lpFee?: number;
  tradingApr?: number;
  totalApy?: number;
  liquidStakingApr?: number;
  composablePoolApr?: number;
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
  liquidStakingAprs?: number,
  composablePoolAprs?: number
): ApyBreakdownResult => {
  const result: ApyBreakdownResult = {
    apys: {},
    apyBreakdowns: {},
  };

  pools.forEach((pool, i) => {
    const liquidStakingApr: number | undefined = liquidStakingAprs
      ? liquidStakingAprs[i]
      : undefined;

    const composablePoolApr: number | undefined = composablePoolAprs
      ? composablePoolAprs[i].toNumber()
      : undefined;

    const extraApr =
      liquidStakingAprs && composablePoolAprs
        ? liquidStakingApr + composablePoolApr
        : liquidStakingAprs
        ? liquidStakingApr
        : composablePoolAprs
        ? composablePoolApr
        : 0;

    const simpleApr = farmAprs[i]?.toNumber();
    const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;
    const vaultApr = simpleApr * shareAfterBeefyPerformanceFee;
    let vaultApy = compound(simpleApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);

    const tradingApr: number | undefined = (
      (tradingAprs[pool.address.toLowerCase()] ?? new BigNumber(0)).isFinite()
        ? tradingAprs[pool.address.toLowerCase()]
        : new BigNumber(0)
    )?.toNumber();

    const totalApy =
      getFarmWithTradingFeesApy(simpleApr, tradingApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee) +
      extraApr;

    // Add token to APYs object
    result.apys[pool.name] = totalApy;
    result.apyBreakdowns[pool.name] = {
      vaultApr: vaultApr,
      compoundingsPerYear: BASE_HPY,
      beefyPerformanceFee: beefyPerformanceFee,
      vaultApy: vaultApy,
      lpFee: providerFee,
      tradingApr: tradingApr,
      liquidStakingApr: liquidStakingApr,
      composablePoolApr: composablePoolApr,
      totalApy: totalApy,
    };
  });

  return result;
};

export default getApyBreakdown;
