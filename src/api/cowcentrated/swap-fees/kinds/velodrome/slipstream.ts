import { fixedFee, rangedFee } from '../../fee.ts';
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

/** Slipstream factories ignore a fee module answer above this and fall back to the tick spacing fee */
const MAX_MODULE_FEE = 100_000;

/**
 * Classic Slipstream DynamicSwapFeeModule, as returned via CLFactory.getSwapFee: the zero fee indicator means no fee,
 * and the factory replaces any fee above MAX_MODULE_FEE with the tick spacing fee.
 */
export function slipstreamModuleFee(params: VolatilityFeeParams): ClmSwapFee {
  const guard = (fee: number) => (fee > MAX_MODULE_FEE ? params.tickSpacingFee : fee);
  const { current, min, max, firstSwap } = volatilityFeeBounds(params);
  return rangedFee(
    guard(current),
    guard(min),
    // fees past the factory limit fall back, so the limit is the highest fee that can be charged
    Math.max(guard(min), Math.min(max, MAX_MODULE_FEE)),
    firstSwap === undefined ? undefined : guard(firstSwap)
  );
}

/** Classic Slipstream: a fee module shared by every pool of the factory */
export const slipstream = defineKind({
  name: 'velodrome/slipstream',
  probe: pool =>
    pool.factory && { module: probe({ address: pool.factory, abi: clFactoryAbi, functionName: 'swapFeeModule' }) },
  match: (pool, { module }) => matchFeeSource(pool, module),
  fee: async (pool, reader) => {
    const config = await readDynamicFeeConfig(pool, reader, { allowLegacy: true });
    // custom fee modules have no dynamic fee config: they charge a fixed fee per pool, which pool.fee() returns
    if (!config) return fixedFee(await reader.read({ address: pool.address, abi: clPoolAbi, functionName: 'fee' }));

    const params = await readVolatilityFeeParams(pool, config, reader, {
      twapRounding: 'truncate',
      minObservations: secondsAgo => Math.floor(secondsAgo / 2),
    });
    return slipstreamModuleFee(params);
  },
});
