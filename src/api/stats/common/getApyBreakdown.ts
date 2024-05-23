import BigNumber from 'bignumber.js';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { compound } from '../../../utils/compound';
import { BASE_HPY } from '../../../constants';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import { infinityToMaxInt, toNumber } from '../../../utils/number';

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
  merklApr?: number;
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
  merklAprs?: number[]
): ApyBreakdownResult => {
  const result: ApyBreakdownResult = {
    apys: {},
    apyBreakdowns: {},
  };

  if (providerFee === undefined) {
    providerFee = 0;
  }

  pools.forEach((pool, i) => {
    const provFee = toNumber(providerFee[i]);
    const beefyPerformanceFee =
      pool.beefyFee == undefined ? getTotalPerformanceFeeForVault(pool.name) : pool.beefyFee;
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

    // Non-compoundable components
    const liquidStakingApr: number | undefined = liquidStakingAprs
      ? toNumber(liquidStakingAprs[i])
      : undefined;

    const composablePoolApr: number | undefined = composablePoolAprs
      ? toNumber(composablePoolAprs[i])
      : undefined;

    const merklApr: number | undefined = merklAprs ? toNumber(merklAprs[i]) : undefined;

    const extraApr = (liquidStakingApr ?? 0) + (composablePoolApr ?? 0) + (merklApr ?? 0);

    // Compoundable components
    const vaultAprBeforeFee = toNumber(farmAprs[i]);
    const vaultApr = vaultAprBeforeFee
      ? vaultAprBeforeFee * shareAfterBeefyPerformanceFee
      : undefined;

    const clmAprBeforeFee: number | undefined = clmAprs ? toNumber(clmAprs[i]) : undefined;
    const clmApr = clmAprBeforeFee ? clmAprBeforeFee * shareAfterBeefyPerformanceFee : undefined;

    const compoundableApr = (vaultAprBeforeFee ?? 0) + (clmAprBeforeFee ?? 0);

    // Trading Apr
    const tradingApr = toNumber(tradingAprs?.[pool.address.toLowerCase()]);

    // Legacy: (Compounded) Vault (Farm) APY only [Not used in app]
    const vaultApy = vaultAprBeforeFee
      ? compound(vaultAprBeforeFee, BASE_HPY, 1, shareAfterBeefyPerformanceFee)
      : undefined;

    // Total APY = (((1 + Compounded APY) * (1 + Trading APR)) - 1) + Extra APR
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
      compoundingsPerYear: BASE_HPY,
      beefyPerformanceFee: beefyPerformanceFee,
      lpFee: provFee,
      vaultApy: infinityToMaxInt(vaultApy), // Infinity is not supported by JSON
      vaultApr: infinityToMaxInt(vaultApr),
      tradingApr: infinityToMaxInt(tradingApr),
      liquidStakingApr: infinityToMaxInt(liquidStakingApr),
      composablePoolApr: infinityToMaxInt(composablePoolApr),
      clmApr: infinityToMaxInt(clmApr),
      merklApr: infinityToMaxInt(merklApr),
      totalApy: infinityToMaxInt(totalApy),
    };
  });

  return result;
};

export default getApyBreakdown;
