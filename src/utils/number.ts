import { isBigNumber, isFiniteBigNumber } from './big-number';

export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

export function isFiniteNumber(value: any): value is number {
  return value !== null && isNumber(value) && !isNaN(value) && isFinite(value);
}

export function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;

  const sorted = values.sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    // Average of two middle values when length is even
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

/**
 * If finite number or BigNumber is provided, return as number, otherwise return the default value.
 * Disallows Infinity and NaN
 */
export function toFiniteNumber<T = undefined>(value: any, defaultValue: T = undefined): number | T {
  if (isFiniteNumber(value)) {
    return value;
  }
  if (isFiniteBigNumber(value)) {
    return value.toNumber();
  }
  return defaultValue;
}

/**
 * If number or BigNumber is provided, return as number, otherwise return the default value.
 * Allows Infinity, Disallows NaN
 */
export function toNumber<T = undefined>(value: any, defaultValue: T = undefined): number | T {
  if (isNumber(value)) {
    return isNaN(value) ? defaultValue : value;
  }
  if (isBigNumber(value)) {
    return value.isNaN() ? defaultValue : value.toNumber();
  }
  return defaultValue;
}

/**
 * Infinity can't be serialized to JSON, so we convert it to MAX/MIN_SAFE_INTEGER
 */
export function infinityToMaxInt(value: number): number {
  if (value === Infinity) {
    return Number.MAX_SAFE_INTEGER;
  } else if (value === -Infinity) {
    return Number.MIN_SAFE_INTEGER;
  }
  return value;
}
