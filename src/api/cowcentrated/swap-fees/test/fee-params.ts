import type { VolatilityFeeConfig, VolatilityFeeParams } from '../kinds/velodrome/helpers.ts';

export const ZERO_FEE_INDICATOR = 420;

/** base 400 + |100 - 0| * 10 = 1400, capped at 10_000 */
export const volatileConfig = { baseFee: 400, feeCap: 10_000, scalingFactor: 10_000_000n };

export function volatilityParams(
  config: Partial<VolatilityFeeConfig>,
  overrides: Partial<Omit<VolatilityFeeParams, 'config'>> = {}
): VolatilityFeeParams {
  return {
    config: { baseFee: 0, feeCap: 0, scalingFactor: 0n, ...config },
    zeroFeeIndicator: ZERO_FEE_INDICATOR,
    defaultScalingFactor: 0n,
    defaultFeeCap: 50_000,
    tickSpacingFee: 500,
    tick: 100,
    twapTick: 0,
    ...overrides,
  };
}

/** Algebra Integral's default adaptive fee config: both sigmoids are 0 at zero volatility, range 100..15_000 */
export const integralDefaults = {
  alpha1: 2900,
  alpha2: 12_000,
  beta1: 360,
  beta2: 60_000,
  gamma1: 59,
  gamma2: 8500,
  baseFee: 100,
};
