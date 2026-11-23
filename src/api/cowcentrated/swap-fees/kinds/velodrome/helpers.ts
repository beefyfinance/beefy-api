import { type Address, parseAbi } from 'viem';
import { PIPS } from '../../fee.ts';
import type { PoolBase } from '../../kind.ts';
import type { Reader } from '../../reader.ts';

const poolAbi = parseAbi([
  'function tickSpacing() view returns (int24)',
  'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, bool unlocked)',
  'function observe(uint32[] secondsAgos) view returns (int56[] tickCumulatives, uint160[] secondsPerLiquidityCumulativeX128s)',
]);
const factoryAbi = parseAbi(['function tickSpacingToFee(int24 tickSpacing) view returns (uint24)']);
const feeSourceAbi = parseAbi([
  'function dynamicFeeConfig(address pool) view returns (uint24 baseFee, uint24 feeCap, uint64 scalingFactor, bool initialFeeEnabled, uint24 initialFee)',
  'function ZERO_FEE_INDICATOR() view returns (uint256)',
  'function defaultScalingFactor() view returns (uint256)',
  'function defaultFeeCap() view returns (uint256)',
  'function secondsAgo() view returns (uint32)',
]);
// decoding an older module's 3 field config with the 5 field abi fails, the reverse would truncate
const legacyFeeSourceAbi = parseAbi([
  'function dynamicFeeConfig(address pool) view returns (uint24 baseFee, uint24 feeCap, uint64 scalingFactor)',
]);

/** MAX_TICK - MIN_TICK, the largest possible |tick - twap| */
const MAX_TICK_DELTA = 1_774_544n;

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
export function volatilityFee(tick: number, twapTick: number | undefined, scalingFactor: bigint): number {
  if (twapTick === undefined) return 0;
  const delta = BigInt(Math.abs(tick - twapTick));
  return Number((delta * scalingFactor) / BigInt(PIPS));
}

export function maxVolatilityFee(scalingFactor: bigint): number {
  return Number((MAX_TICK_DELTA * scalingFactor) / BigInt(PIPS));
}

/** A zero scaling factor falls back to the defaults for both the scaling factor and the cap */
export function effectiveScaling(params: VolatilityFeeParams) {
  const { config } = params;
  return config.scalingFactor === 0n
    ? { scalingFactor: params.defaultScalingFactor, feeCap: params.defaultFeeCap }
    : { scalingFactor: config.scalingFactor, feeCap: config.feeCap };
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

/** A pool whose fee comes from a Slipstream style fee module or hook */
export type VolatilityFeePool = PoolBase & { factory: Address; source: Address };

/** undefined if the source has no dynamic fee config for the pool */
export async function readDynamicFeeConfig(
  pool: VolatilityFeePool,
  reader: Reader,
  { allowLegacy }: { allowLegacy: boolean }
): Promise<VolatilityFeeConfig | undefined> {
  const config = await reader.tryRead({
    address: pool.source,
    abi: feeSourceAbi,
    functionName: 'dynamicFeeConfig',
    args: [pool.address],
  });
  if (config.ok) {
    const [baseFee, feeCap, scalingFactor, initialFeeEnabled, initialFee] = config.value;
    return { baseFee, feeCap, scalingFactor, initialFeeEnabled, initialFee };
  }
  if (!allowLegacy) return undefined;

  const legacyConfig = await reader.tryRead({
    address: pool.source,
    abi: legacyFeeSourceAbi,
    functionName: 'dynamicFeeConfig',
    args: [pool.address],
  });
  if (!legacyConfig.ok) return undefined;
  const [baseFee, feeCap, scalingFactor] = legacyConfig.value;
  return { baseFee, feeCap, scalingFactor };
}

async function readTickSpacingFee(pool: VolatilityFeePool, reader: Reader): Promise<number> {
  const tickSpacing = await reader.read({ address: pool.address, abi: poolAbi, functionName: 'tickSpacing' });
  return reader.read({ address: pool.factory, abi: factoryAbi, functionName: 'tickSpacingToFee', args: [tickSpacing] });
}

export type VolatilityFeeOptions = {
  twapRounding: 'floor' | 'truncate';
  /** the source skips the volatility part while the pool keeps fewer observations */
  minObservations(secondsAgo: number): number;
};

/** Inputs for recomputing the fee from config and twap, rather than reading the pool's fee() */
export async function readVolatilityFeeParams(
  pool: VolatilityFeePool,
  config: VolatilityFeeConfig,
  reader: Reader,
  options: VolatilityFeeOptions
): Promise<VolatilityFeeParams> {
  const source = { address: pool.source, abi: feeSourceAbi } as const;
  const [zeroFeeIndicator, defaultScalingFactor, defaultFeeCap, secondsAgo, slot0, tickSpacingFee] = await Promise.all([
    reader.tryRead({ ...source, functionName: 'ZERO_FEE_INDICATOR' }),
    reader.read({ ...source, functionName: 'defaultScalingFactor' }),
    reader.read({ ...source, functionName: 'defaultFeeCap' }),
    reader.read({ ...source, functionName: 'secondsAgo' }),
    reader.read({ address: pool.address, abi: poolAbi, functionName: 'slot0' }),
    readTickSpacingFee(pool, reader),
  ]);
  const [, tick, , observationCardinality] = slot0;

  const scalingFactor = config.scalingFactor || defaultScalingFactor;
  const canObserve =
    scalingFactor > 0n && secondsAgo > 0 && observationCardinality >= options.minObservations(secondsAgo);
  // a reverting observe (not enough history) means no volatility part, same as on-chain
  const observation = canObserve
    ? await reader.tryRead({ address: pool.address, abi: poolAbi, functionName: 'observe', args: [[secondsAgo, 0]] })
    : undefined;

  return {
    config,
    zeroFeeIndicator: zeroFeeIndicator.ok ? Number(zeroFeeIndicator.value) : undefined,
    defaultScalingFactor,
    defaultFeeCap: Number(defaultFeeCap),
    tickSpacingFee,
    tick,
    twapTick: observation?.ok ? twapTick(observation.value[0], secondsAgo, options.twapRounding) : undefined,
  };
}
