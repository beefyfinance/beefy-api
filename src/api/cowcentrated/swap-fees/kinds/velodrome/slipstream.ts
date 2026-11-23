import { parseAbi } from 'viem';
import { poolAbi } from '../../abis.ts';
import { fixedFee, rangedFee } from '../../fee.ts';
import { contractOf, defineKind, probe } from '../../kind.ts';
import type { ClmSwapFee } from '../../types.ts';
import {
  effectiveScaling,
  maxVolatilityFee,
  readDynamicFeeConfig,
  readVolatilityFeeParams,
  type VolatilityFeeParams,
  volatilityFee,
} from './helpers.ts';

const factoryAbi = parseAbi(['function swapFeeModule() view returns (address)']);

/** Slipstream factories ignore a fee module answer above this and fall back to the tick spacing fee */
const MAX_MODULE_FEE = 100_000;

/**
 * Classic Slipstream DynamicSwapFeeModule, as returned via CLFactory.getSwapFee:
 * min(base + |tick - twap| * K / 1e6, cap), where the factory replaces any answer above 10% with the tick spacing fee.
 * The first swap in a block can pay a separate (uncapped) initial fee.
 */
export function slipstreamModuleFee(params: VolatilityFeeParams): ClmSwapFee {
  const { config, zeroFeeIndicator, tickSpacingFee } = params;
  const factoryGuard = (fee: number) => (fee > MAX_MODULE_FEE ? tickSpacingFee : fee);
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
    Math.max(factoryGuard(min), Math.min(max, MAX_MODULE_FEE)),
    firstSwap === undefined ? undefined : factoryGuard(firstSwap)
  );
}

/** Classic Slipstream: a fee module shared by every pool of the factory */
export const slipstream = defineKind({
  name: 'velodrome/slipstream',
  probe: pool =>
    pool.factory && { module: probe({ address: pool.factory, abi: factoryAbi, functionName: 'swapFeeModule' }) },
  match: (pool, { module }) => {
    const source = contractOf(module);
    return source && pool.factory && { source, factory: pool.factory };
  },
  fee: async (pool, reader) => {
    const config = await readDynamicFeeConfig(pool, reader, { allowLegacy: true });
    // custom fee modules have no dynamic fee config: they charge a fixed fee per pool, which pool.fee() returns
    if (!config) return fixedFee(await reader.read({ address: pool.address, abi: poolAbi, functionName: 'fee' }));

    const params = await readVolatilityFeeParams(pool, config, reader, {
      twapRounding: 'truncate',
      minObservations: secondsAgo => Math.floor(secondsAgo / 2),
    });
    return slipstreamModuleFee(params);
  },
});
