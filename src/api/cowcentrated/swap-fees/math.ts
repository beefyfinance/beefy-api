import type { ClmSwapFee } from './types.ts';

/** pool fee units: 1e6 = 100% */
export const PIPS = 1_000_000;
/** Slipstream factories ignore a fee module answer above this and fall back to the tick spacing fee */
const SLIPSTREAM_MAX_MODULE_FEE = 100_000;
/** Aero hook pools clamp the hook's fee to SWAP_FEE_CEIL */
const AERO_SWAP_FEE_CEIL = 100_000;
/** MAX_TICK - MIN_TICK, the largest possible |tick - twap| */
const MAX_TICK_DELTA = 1_774_544n;
const ALGEBRA_MAX_FEE = 65_535;

export function toFraction(pips: number): number {
  return pips / PIPS;
}

export function fixedFee(pips: number): ClmSwapFee {
  return { current: toFraction(pips), dynamic: false };
}

/** Fee set by an off-chain keeper: changes often but has no on-chain bounds */
export function managedFee(pips: number): ClmSwapFee {
  return { current: toFraction(pips), dynamic: true };
}

function rangedFee(current: number, min: number, max: number, firstSwap?: number): ClmSwapFee {
  const fee: ClmSwapFee =
    min < max
      ? { current: toFraction(current), dynamic: true, min: toFraction(min), max: toFraction(max) }
      : { current: toFraction(current), dynamic: false };
  if (firstSwap !== undefined && firstSwap !== current) {
    fee.firstSwap = toFraction(firstSwap);
  }
  return fee;
}

export type VolatilityFeeConfig = {
  baseFee: number;
  feeCap: number;
  scalingFactor: bigint;
  /** undefined for legacy fee modules without an initial fee */
  initialFeeEnabled?: boolean;
  initialFee?: number;
};

export type VolatilityFeeParams = {
  config: VolatilityFeeConfig;
  /** undefined if the source has no ZERO_FEE_INDICATOR */
  zeroFeeIndicator: number | undefined;
  defaultScalingFactor: bigint;
  defaultFeeCap: number;
  tickSpacingFee: number;
  /** current tick and time weighted average tick, undefined when the twap is unavailable (fee falls back to base) */
  tick: number;
  twapTick: number | undefined;
};

/** floor(|tick - twap| * K / 1e6), the volatility part of a Slipstream style fee */
function volatilityFee(tick: number, twapTick: number | undefined, scalingFactor: bigint): number {
  if (twapTick === undefined) return 0;
  const delta = BigInt(Math.abs(tick - twapTick));
  return Number((delta * scalingFactor) / BigInt(PIPS));
}

function maxVolatilityFee(scalingFactor: bigint): number {
  return Number((MAX_TICK_DELTA * scalingFactor) / BigInt(PIPS));
}

/** A zero scaling factor falls back to the defaults for both the scaling factor and the cap */
function effectiveScaling(params: VolatilityFeeParams) {
  const { config } = params;
  return config.scalingFactor === 0n
    ? { scalingFactor: params.defaultScalingFactor, feeCap: params.defaultFeeCap }
    : { scalingFactor: config.scalingFactor, feeCap: config.feeCap };
}

/**
 * Classic Slipstream DynamicSwapFeeModule, as returned via CLFactory.getSwapFee:
 * min(base + |tick - twap| * K / 1e6, cap), where the factory replaces any answer above 10% with the tick spacing fee.
 * The first swap in a block can pay a separate (uncapped) initial fee.
 */
export function slipstreamModuleFee(params: VolatilityFeeParams): ClmSwapFee {
  const { config, zeroFeeIndicator, tickSpacingFee } = params;
  const factoryGuard = (fee: number) => (fee > SLIPSTREAM_MAX_MODULE_FEE ? tickSpacingFee : fee);
  if (config.baseFee === zeroFeeIndicator) {
    return fixedFee(0);
  }

  const base = config.baseFee || tickSpacingFee;
  const { scalingFactor, feeCap } = effectiveScaling(params);
  const current = Math.min(base + volatilityFee(params.tick, params.twapTick, scalingFactor), feeCap);
  const min = Math.min(base, feeCap);
  const max = scalingFactor === 0n ? min : Math.min(base + maxVolatilityFee(scalingFactor), feeCap);
  const firstSwap = config.initialFeeEnabled
    ? config.initialFee === zeroFeeIndicator
      ? 0
      : config.initialFee || base
    : undefined;

  return rangedFee(
    factoryGuard(current),
    factoryGuard(min),
    // fees past the factory limit fall back, so the limit is the highest fee that can be charged
    Math.max(factoryGuard(min), Math.min(max, SLIPSTREAM_MAX_MODULE_FEE)),
    firstSwap === undefined ? undefined : factoryGuard(firstSwap)
  );
}

/**
 * Aero (MetaDEX) DynamicSwapFeeHook: same formula as the Slipstream module, but the zero fee indicator
 * means the tick spacing fee, and the pool clamps the result to SWAP_FEE_CEIL.
 * Leaves out the priority fee MEV tax and caller discounts, which typical swaps don't pay/get.
 */
export function aeroHookFee(params: VolatilityFeeParams): ClmSwapFee {
  const { config, zeroFeeIndicator, tickSpacingFee } = params;
  const ceil = (fee: number) => Math.min(fee, AERO_SWAP_FEE_CEIL) || tickSpacingFee;
  if (config.baseFee === zeroFeeIndicator) {
    return fixedFee(tickSpacingFee);
  }

  const base = config.baseFee || tickSpacingFee;
  const { scalingFactor, feeCap } = effectiveScaling(params);
  const current = Math.min(base + volatilityFee(params.tick, params.twapTick, scalingFactor), feeCap);
  const min = Math.min(base, feeCap);
  const max = scalingFactor === 0n ? min : Math.min(base + maxVolatilityFee(scalingFactor), feeCap);
  const firstSwap = config.initialFeeEnabled
    ? config.initialFee === zeroFeeIndicator
      ? tickSpacingFee
      : config.initialFee || base
    : undefined;

  return rangedFee(ceil(current), ceil(min), ceil(max), firstSwap === undefined ? undefined : ceil(firstSwap));
}

/** Time weighted average tick; Solidity int division truncates, the Aero hook rounds towards negative infinity */
export function twapTick(
  tickCumulatives: readonly bigint[],
  secondsAgo: number,
  rounding: 'truncate' | 'floor'
): number {
  const delta = tickCumulatives[1] - tickCumulatives[0];
  const seconds = BigInt(secondsAgo);
  let tick = delta / seconds;
  if (rounding === 'floor' && delta < 0n && delta % seconds !== 0n) {
    tick -= 1n;
  }
  return Number(tick);
}

export type AlgebraSigmoids = {
  alpha1: number;
  alpha2: number;
  beta1: number;
  beta2: number;
  gamma1: number;
  gamma2: number;
  baseFee: number;
};

export type AlgebraV1FeeConfig = AlgebraSigmoids & {
  volumeBeta: number;
  volumeGamma: number;
};

/**
 * Algebra's sigmoid: alpha / (1 + e^((beta - x) / gamma)), exactly 0 or alpha beyond 6 gammas from beta.
 * Only used for the lower bound, so a float is close enough between those.
 */
function sigmoid(x: number, gamma: number, alpha: number, beta: number): number {
  if (beta - x >= 6 * gamma) return 0;
  if (x - beta >= 6 * gamma) return alpha;
  return Math.floor(alpha / (1 + Math.exp((beta - x) / gamma)));
}

function volatilityPart(config: AlgebraSigmoids, volatility: number): number {
  return Math.min(
    sigmoid(volatility, config.gamma1, config.alpha1, config.beta1)
      + sigmoid(volatility, config.gamma2, config.alpha2, config.beta2),
    ALGEBRA_MAX_FEE
  );
}

/** Algebra Integral adaptive fee: baseFee + two volatility sigmoids */
export function algebraIntegralRange(config: AlgebraSigmoids): { min: number; max: number } {
  return {
    min: config.baseFee + volatilityPart(config, 0),
    max: Math.min(config.baseFee + config.alpha1 + config.alpha2, ALGEBRA_MAX_FEE),
  };
}

/** Algebra v1 adaptive fee: baseFee + sigmoid(volume, volumeGamma, volatility sigmoids, volumeBeta) */
export function algebraV1Range(config: AlgebraV1FeeConfig): { min: number; max: number } {
  const volatilityAtZero = volatilityPart(config, 0);
  return {
    min: config.baseFee + sigmoid(0, config.volumeGamma, volatilityAtZero, config.volumeBeta),
    max: Math.min(config.baseFee + Math.min(config.alpha1 + config.alpha2, ALGEBRA_MAX_FEE), ALGEBRA_MAX_FEE),
  };
}

export function algebraFee(current: number, ranges: { min: number; max: number }[]): ClmSwapFee {
  const min = Math.min(...ranges.map(r => r.min));
  const max = Math.max(...ranges.map(r => r.max));
  return rangedFee(current, min, max);
}

/** Integral pools only charge the plugin's fee if both the before-swap hook and dynamic fee flags are on */
const ALGEBRA_INTEGRAL_DYNAMIC_FEE_FLAGS = 0x81;

export function isAlgebraIntegralFeeActive(pluginConfig: number): boolean {
  return (pluginConfig & ALGEBRA_INTEGRAL_DYNAMIC_FEE_FLAGS) === ALGEBRA_INTEGRAL_DYNAMIC_FEE_FLAGS;
}
