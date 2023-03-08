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
