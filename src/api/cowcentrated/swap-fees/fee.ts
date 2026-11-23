import type { ClmSwapFee } from './types.ts';

/** pool fee units: 1e6 = 100% */
export const PIPS = 1_000_000;

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

/** dynamic between min and max, or fixed if they are the same */
export function rangedFee(current: number, min: number, max: number, firstSwap?: number): ClmSwapFee {
  const fee: ClmSwapFee =
    min < max
      ? { current: toFraction(current), dynamic: true, min: toFraction(min), max: toFraction(max) }
      : { current: toFraction(current), dynamic: false };
  if (firstSwap !== undefined && firstSwap !== current) {
    fee.firstSwap = toFraction(firstSwap);
  }
  return fee;
}
