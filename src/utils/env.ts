/**
 * Undefined, NaN, or Infinity returns defaultValue
 * Otherwise returns value cast to Number
 */
export function envNumber(key: string, defaultValue: number): number {
  if (!(key in process.env)) {
    return defaultValue;
  }

  const value = process.env[key];
  if (value.length === 0) {
    return defaultValue;
  }

  const numberValue = Number(value);
  if (isNaN(numberValue) || !isFinite(numberValue)) {
    return defaultValue;
  }

  return numberValue;
}

/**
 * Undefined returns defaultValue
 * "true" or "1" returns true
 * Otherwise returns false
 */
export function envBoolean(key: string, defaultValue: boolean): boolean {
  if (!(key in process.env)) {
    return defaultValue;
  }

  const value = process.env[key];
  if (value.length === 0) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true' || value === '1';
}
