export const BIGINT_UNIT_18 = 10n ** 18n;

export function bigintToNumber(value: bigint): number {
  if (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER) {
    return Number(value);
  }

  throw new Error(`BigInt ${value} is out of range for a Number`);
}

const decimalsCache: Record<number, bigint> = {
  18: BIGINT_UNIT_18,
};

/** returns 10^{decimals} (aka 1e{decimals}) */
export function bigintDecimals(decimals: number): bigint {
  const existing = decimalsCache[decimals];
  if (existing) {
    return existing;
  }

  const output = 10n ** BigInt(decimals);
  decimalsCache[decimals] = output;
  return output;
}
