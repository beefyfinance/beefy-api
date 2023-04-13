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
