/** Returns an object mapping each of `keys` to `fn(key)` */
export function keysToObject<K extends PropertyKey, V>(keys: readonly K[], fn: (key: K) => V): Record<K, V> {
  return keys.reduce(
    (acc, key) => {
      acc[key] = fn(key);
      return acc;
    },
    {} as Record<K, V>
  );
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

export function isArrayValue<const T>(value: unknown, validValues: T[] | readonly T[]): value is T {
  return (validValues as unknown[]).includes(value);
}
