import { BigNumberish } from '../../../utils/big-number';
import { toNumber } from '../../../utils/number';
import { BASE_HPY } from '../../../constants';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { toArray } from '../../../utils/array';

// These component lists need to stay in sync with the app
// Total APY = (((1 + Compounded APY) * (1 + Special APR)) - 1) + Non-Compoundable APR.

/** compoundable component */
const compoundableComponents = [
  'vault', // Farm rewards compounded
  'clm', // CLM fees compounded
] as const;

/** non-compoundable component */
const nonCompoundableComponents = [
  'liquidStaking',
  'composablePool',
  'merkl',
  'stellaSwap',
  'rewardPool',
  'rewardPoolTrading', // CLM fees sent to reward pool e.g. VELO, RAM etc
] as const;

/** special component */
const specialComponents = ['trading'] as const;

type CompoundableComponent = (typeof compoundableComponents)[number];
type NonCompoundableComponent = (typeof nonCompoundableComponents)[number];
type SpecialComponent = (typeof specialComponents)[number];

type ToAprComponents<T extends string> = {
  [key in T as `${key}Apr`]?: number | undefined;
};

type AprBreakdown = ToAprComponents<CompoundableComponent> &
  ToAprComponents<NonCompoundableComponent> &
  ToAprComponents<SpecialComponent>;

export type ApyBreakdown = AprBreakdown & {
  /**
   * Total APY = (((1 + Compounded APY) * (1 + Special APR)) - 1) + Non-Compoundable APR.
   */
  totalApy: number;
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
   * @deprecated no longer returned by getApyBreakdown / not used in app
   */
  vaultApy?: number;
};

type ToInputComponents<T extends string> = {
  [key in T]?: BigNumberish | null | undefined;
};

type BreakdownRequestComponents = ToInputComponents<CompoundableComponent> &
  ToInputComponents<NonCompoundableComponent> &
  ToInputComponents<SpecialComponent>;

/**
 * Total APY = (((1 + Compounded APY) * (1 + Special APR)) - 1) + Non-Compoundable APR.
 */
export type ApyBreakdownRequest = BreakdownRequestComponents & {
  vaultId: string;
  providerFee?: BigNumberish | null | undefined;
  beefyFee?: BigNumberish | null | undefined;
  compoundingsPerYear?: BigNumberish | null | undefined;
};

export interface ApyBreakdownResult {
  apys: Record<string, number>;
  apyBreakdowns: Record<string, ApyBreakdown>;
}

export function getApyBreakdownOnly(request: ApyBreakdownRequest): ApyBreakdown {
  const compoundingsPerYear = toNumber(request.compoundingsPerYear, BASE_HPY);
  const lpFee = toNumber(request.providerFee);
  const beefyPerformanceFee = toNumber(
    request.beefyFee,
    getTotalPerformanceFeeForVault(request.vaultId)
  );
  const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;
  const breakdown: ApyBreakdown = {
    compoundingsPerYear,
    beefyPerformanceFee,
    lpFee,
    totalApy: 0,
  };

  let totalCompoundable = 0;
  for (const component of compoundableComponents) {
    const apr = toNumber(request[component]);
    if (apr !== undefined) {
      const aprAfterFee = apr * shareAfterBeefyPerformanceFee;
      breakdown[`${component}Apr`] = aprAfterFee;
      totalCompoundable += aprAfterFee;
    }
  }

  let totalNonCompoundable = 0;
  for (const component of nonCompoundableComponents) {
    const apr = toNumber(request[component]);
    if (apr !== undefined) {
      breakdown[`${component}Apr`] = apr;
      totalNonCompoundable += apr;
    }
  }

  let totalSpecial = 0;
  for (const component of specialComponents) {
    const apr = toNumber(request[component]);
    if (apr !== undefined) {
      breakdown[`${component}Apr`] = apr;
      totalSpecial += apr;
    }
  }

  // @dev shareAfterBeefyPerformanceFee = 1 as fee is already removed from all components
  breakdown.totalApy =
    getFarmWithTradingFeesApy(totalCompoundable, totalSpecial, compoundingsPerYear, 1, 1) +
    totalNonCompoundable;

  return breakdown;
}

/**
 * Total APY = (((1 + Compounded APY) * (1 + Special APR)) - 1) + Non-Compoundable APR.
 */
export function getApyBreakdown(
  requests: ApyBreakdownRequest | ApyBreakdownRequest[]
): ApyBreakdownResult {
  const result: ApyBreakdownResult = {
    apys: {},
    apyBreakdowns: {},
  };

  toArray(requests).forEach(input => {
    const breakdown = getApyBreakdownOnly(input);

    // Add token to APYs object
    result.apys[input.vaultId] = breakdown.totalApy;
    result.apyBreakdowns[input.vaultId] = breakdown;
  });

  return result;
}
