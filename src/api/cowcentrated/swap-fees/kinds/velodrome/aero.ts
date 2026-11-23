import { parseAbi } from 'viem';
import { poolAbi } from '../../abis.ts';
import { fixedFee, managedFee, rangedFee } from '../../fee.ts';
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

const factoryAbi = parseAbi(['function getPoolSwapHook(address pool) view returns (address)']);

/** Aero hook pools clamp the hook's fee to SWAP_FEE_CEIL */
const SWAP_FEE_CEIL = 100_000;

/**
 * Aero (MetaDEX) DynamicSwapFeeHook: same formula as the Slipstream module, but the zero fee indicator
 * means the tick spacing fee, and the pool clamps the result to SWAP_FEE_CEIL.
 * Leaves out the priority fee MEV tax and caller discounts, which typical swaps don't pay/get.
 */
export function aeroHookFee(params: VolatilityFeeParams): ClmSwapFee {
  const { config, zeroFeeIndicator, tickSpacingFee } = params;
  const ceil = (fee: number) => Math.min(fee, SWAP_FEE_CEIL) || tickSpacingFee;
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

/** Aero (MetaDEX): a swap hook per pool */
export const aero = defineKind({
  name: 'velodrome/aero',
  probe: pool =>
    pool.factory && {
      hook: probe({ address: pool.factory, abi: factoryAbi, functionName: 'getPoolSwapHook', args: [pool.address] }),
    },
  match: (pool, { hook }) => {
    const source = contractOf(hook);
    return source && pool.factory && { source, factory: pool.factory };
  },
  fee: async (pool, reader) => {
    const config = await readDynamicFeeConfig(pool, reader, { allowLegacy: false });
    // fee() is what a swap would pay at the read block: for hooks with a first swap fee, that is the first swap
    // fee unless the pool already swapped in that block
    if (!config) return managedFee(await reader.read({ address: pool.address, abi: poolAbi, functionName: 'fee' }));

    const params = await readVolatilityFeeParams(pool, config, reader, {
      twapRounding: 'floor',
      minObservations: () => 0,
    });
    return aeroHookFee(params);
  },
});
