/**
 * Returns an object with the keys of the given array and the values of the given function
 * Assumes the keys array contains an entry for each key in the object
 * @param keys
 * @param fn
 */
export function keysToObject<T extends object>(
  keys: (keyof T)[],
  fn: (key: keyof T) => T[keyof T]
): T {
  return keys.reduce((acc: T, key: keyof T) => {
    acc[key] = fn(key);
    return acc;
  }, {} as T);
}

export type NonEmptyArray<T> = [T, ...T[]];

export function isNonEmptyArray<T>(arr: T[] | undefined | null): arr is NonEmptyArray<T> {
  return !!arr && Array.isArray(arr) && arr.length > 0;
}

export function isDefined<T>(value: T): value is Exclude<T, undefined | null> {
  return value !== undefined && value !== null;
}

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function numberRange(start: number, end?: number | undefined): number[] {
  if (end === undefined) {
    end = start;
    start = 0;
  }

  return Array.from({ length: end - start }, (_, i) => i + start);
}

export function bigintRange(start: bigint, end?: bigint | undefined): bigint[] {
  if (end === undefined) {
    end = start;
    start = BigInt(0);
  }

  return Array.from({ length: parseInt((end - start).toString(10)) }, (_, i) => start + BigInt(i));
}
