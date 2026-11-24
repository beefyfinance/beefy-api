import { rangedFee } from '../../fee.ts';
import type { ClmSwapFee } from '../../types.ts';

export const ALGEBRA_MAX_FEE = 65_535;

export type FeeRange = { min: number; max: number };

export type AlgebraSigmoids = {
  alpha1: number;
  alpha2: number;
  beta1: number;
  beta2: number;
  gamma1: number;
  gamma2: number;
  baseFee: number;
};

/**
 * Algebra's sigmoid: alpha / (1 + e^((beta - x) / gamma)), exactly 0 or alpha beyond 6 gammas from beta.
 * Only used for the lower bound, so a float is close enough between those.
 */
export function sigmoid(x: number, gamma: number, alpha: number, beta: number): number {
  if (beta - x >= 6 * gamma) return 0;
  if (x - beta >= 6 * gamma) return alpha;
  return Math.floor(alpha / (1 + Math.exp((beta - x) / gamma)));
}

export function volatilityPart(config: AlgebraSigmoids, volatility: number): number {
  return Math.min(
    sigmoid(volatility, config.gamma1, config.alpha1, config.beta1)
      + sigmoid(volatility, config.gamma2, config.alpha2, config.beta2),
    ALGEBRA_MAX_FEE
  );
}

/** spans the widest of the ranges */
export function algebraFee(current: number, ranges: FeeRange[]): ClmSwapFee {
  const min = Math.min(...ranges.map(r => r.min));
  const max = Math.max(...ranges.map(r => r.max));
  return rangedFee(current, min, max);
}
