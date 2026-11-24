import { managedFee, rangedFee } from '../../fee.ts';
import { defineKind, probe } from '../../kind.ts';
import type { ClmSwapFee } from '../../types.ts';
import {
  clFactoryAbi,
  clPoolAbi,
  matchFeeSource,
  readDynamicFeeConfig,
  readVolatilityFeeParams,
  type VolatilityFeeParams,
  volatilityFeeBounds,
} from './helpers.ts';

/** Aero hook pools clamp the hook's fee to SWAP_FEE_CEIL */
const SWAP_FEE_CEIL = 100_000;

/**
 * Aero (MetaDEX) DynamicSwapFeeHook: the Slipstream formula, where the pool clamps the fee to SWAP_FEE_CEIL and
 * charges the tick spacing fee instead of 0, so the zero fee indicator means the tick spacing fee.
 * Leaves out the priority fee MEV tax and caller discounts, which typical swaps don't pay/get.
 */
export function aeroHookFee(params: VolatilityFeeParams): ClmSwapFee {
  const ceil = (fee: number) => Math.min(fee, SWAP_FEE_CEIL) || params.tickSpacingFee;
  const { current, min, max, firstSwap } = volatilityFeeBounds(params);
  return rangedFee(ceil(current), ceil(min), ceil(max), firstSwap === undefined ? undefined : ceil(firstSwap));
}

/** Aero (MetaDEX): a swap hook per pool */
export const aero = defineKind({
  name: 'velodrome/aero',
  probe: pool =>
    pool.factory && {
      hook: probe({ address: pool.factory, abi: clFactoryAbi, functionName: 'getPoolSwapHook', args: [pool.address] }),
    },
  match: (pool, { hook }) => matchFeeSource(pool, hook),
  fee: async (pool, reader) => {
    const config = await readDynamicFeeConfig(pool, reader, { allowLegacy: false });
    // fee() is what a swap would pay at the read block: for hooks with a first swap fee, that is the first swap
    // fee unless the pool already swapped in that block
    if (!config) return managedFee(await reader.read({ address: pool.address, abi: clPoolAbi, functionName: 'fee' }));

    const params = await readVolatilityFeeParams(pool, config, reader, {
      twapRounding: 'floor',
      minObservations: () => 0,
    });
    return aeroHookFee(params);
  },
});
