export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

export function isFiniteNumber(value: any): value is number {
  return value !== null && isNumber(value) && !isNaN(value) && isFinite(value);
}
