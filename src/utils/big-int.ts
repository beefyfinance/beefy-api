export function bigintToNumber(value: bigint): number {
  if (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER) {
    return Number(value);
  }

  throw new Error(`BigInt ${value} is out of range for a Number`);
}
