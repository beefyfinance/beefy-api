import BigNumber from 'bignumber.js';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { compound } from '../../../utils/compound';
import { BASE_HPY } from '../../../constants';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import { toNumber } from '../../../utils/number';

export interface ApyBreakdown {
  /** Compoundable farm APR */
  vaultApr?: number;
  /** Compoundable CLM trading fees APR (e.g. Uniswap V3 Strategy) */
  clmApr?: number;
  /**
   * LP trading fees APR
   * @see {totalApy} for explanation of how this is uniquely handled
   */
  tradingApr?: number;
  /** Non-compoundable Liquid Staking APR */
  liquidStakingApr?: number;
  /** Non-compoundable Composable Pool APR */
  composablePoolApr?: number;
  /** Non-compoundable Merkle APR */
  merklApr?: number;
  /**
   * Total APY = (((1 + Compounded APY) * (1 + Trading APR)) - 1) + Extra APR.
   * Compounded APY = {vaultApr} + {clmApr} compounded {compoundingsPerYear} times.
   * Extra APR = {liquidStakingApr} + {composablePoolApr} + {merklApr}.
   */
  totalApy?: number;
  /**
   * How many harvests per year are expected, used to compound APR to APY
   * @deprecated not used in app
   */
  compoundingsPerYear?: number;
  /**
   * % of compounding yield that goes to the protocol
   * @deprecated not used in app
   */
  beefyPerformanceFee: number;
  /**
   * underlying ALM's LP fee
   * @deprecated not used in app
   */
  lpFee?: number;
  /**
   * {vaultApr} compounded {compoundingsPerYear} times
   * @deprecated not used in app
   */
  vaultApy?: number;
}

export interface ApyBreakdownResult {
  apys: Record<string, number>;
  apyBreakdowns: Record<string, ApyBreakdown>;
}

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
    const vaultAprBeforeFee: number | undefined = farmAprs ? toNumber(farmAprs[i]) : undefined;
    const vaultApr = vaultAprBeforeFee
      ? vaultAprBeforeFee * shareAfterBeefyPerformanceFee
      : undefined;

    const clmAprBeforeFee: number | undefined = clmAprs ? toNumber(clmAprs[i]) : undefined;
    const clmApr = clmAprBeforeFee ? clmAprBeforeFee * shareAfterBeefyPerformanceFee : undefined;

    const compoundableAprBeforeFee = (vaultAprBeforeFee ?? 0) + (clmAprBeforeFee ?? 0);

    // Trading Apr
    const tradingApr = tradingAprs ? toNumber(tradingAprs[pool.address.toLowerCase()]) : undefined;

    // Legacy: (Compounded) Vault (Farm) APY only [Not used in app]
    const vaultApy = vaultAprBeforeFee
      ? compound(vaultAprBeforeFee, BASE_HPY, 1, shareAfterBeefyPerformanceFee)
      : undefined;

    // Total APY = (((1 + Compounded APY) * (1 + Trading APR)) - 1) + Extra APR
    const totalApy =
      getFarmWithTradingFeesApy(
        compoundableAprBeforeFee,
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
      vaultApy,
      vaultApr,
      tradingApr,
      liquidStakingApr,
      composablePoolApr,
      clmApr,
      merklApr,
      totalApy,
    };
  });

  return result;
};

export default getApyBreakdown;
