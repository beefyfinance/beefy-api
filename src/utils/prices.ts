import { isFiniteNumber } from './number.ts';

export function isValidPrice(value: unknown): value is number {
  if (!isFiniteNumber(value)) {
    return false;
  }
  return value > 0;
}
