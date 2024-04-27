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
  clmApr?: number;
  merkleApr?: number;
}

export interface ApyBreakdownResult {
  apys: Record<string, number>;
  apyBreakdowns: Record<string, ApyBreakdown>;
}

export const getApyBreakdown = (
  pools: { name: string; address: string; beefyFee?: number }[],
  tradingAprs: Record<string, BigNumber> | undefined,
  farmAprs: BigNumber[],
  providerFee?: number | BigNumber[],
  liquidStakingAprs?: number[],
  composablePoolAprs?: number[],
  clmAprs?: number[],
  merkleAprs?: number[]
): ApyBreakdownResult => {
  const result: ApyBreakdownResult = {
    apys: {},
    apyBreakdowns: {},
  };

  if (providerFee === undefined) {
    providerFee = 0;
  }

  pools.forEach((pool, i) => {
    const liquidStakingApr: number | undefined = liquidStakingAprs
      ? liquidStakingAprs[i]
      : undefined;

    const composablePoolApr: number | undefined = composablePoolAprs
      ? composablePoolAprs[i]
      : undefined;

    const clmApr: number | undefined = clmAprs ? clmAprs[i] : undefined;
    const merkleApr: number | undefined = merkleAprs ? merkleAprs[i] : undefined;
    const extraApr = (liquidStakingApr ?? 0) + (composablePoolApr ?? 0) + (merkleApr ?? 0);

    const provFee = providerFee[i] == undefined ? providerFee : providerFee[i].toNumber();
    const simpleApr = farmAprs[i]?.toNumber();
    const beefyPerformanceFee =
      pool.beefyFee == undefined ? getTotalPerformanceFeeForVault(pool.name) : pool.beefyFee;
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;
    const vaultApr = simpleApr * shareAfterBeefyPerformanceFee;

    const compoundableApr = simpleApr + (clmApr ?? 0);
    let vaultApy = compound(compoundableApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);

    let tradingApr: number | undefined = 0;
    if (tradingAprs != null) {
      tradingApr = (
        (tradingAprs[pool.address.toLowerCase()] ?? new BigNumber(0)).isFinite()
          ? tradingAprs[pool.address.toLowerCase()]
          : new BigNumber(0)
      )?.toNumber();
    }

    const totalApy =
      getFarmWithTradingFeesApy(
        compoundableApr,
        tradingApr,
        BASE_HPY,
        1,
        shareAfterBeefyPerformanceFee
      ) + extraApr;

    // Add token to APYs object
    result.apys[pool.name] = totalApy;
    result.apyBreakdowns[pool.name] = {
      vaultApr: vaultApr,
      compoundingsPerYear: BASE_HPY,
      beefyPerformanceFee: beefyPerformanceFee,
      vaultApy: vaultApy,
      lpFee: provFee,
      tradingApr: tradingApr,
      liquidStakingApr: liquidStakingApr,
      composablePoolApr: composablePoolApr,
      clmApr: clmApr,
      totalApy: totalApy,
      merkleApr: merkleApr,
    };
  });

  return result;
};

export default getApyBreakdown;
